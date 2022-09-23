import React, { useState, useEffect } from "react";
import AccessDenied from "../widgets/AccessDenied";
import PreLoader from "../widgets/PreLoader";
import DataTable from "react-data-table-component";
import {
  Col,
  Row,
  Card,
  Form,
  Button,
  Spinner,
} from "@themesberg/react-bootstrap";
import { supabase } from "../../supabaseClient";
import { useHistory, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import EditIcon from "@material-ui/icons/Edit";
import { toast } from 'react-toastify';

export default function EditDiscipline() {
  document.title = "Fitness | Disziplin bearbeiten";
  const state = useSelector((state) => state);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(true);
  const history = useHistory();
  const [discRequiredDetails, setDiscRequiredDetails] = useState([]);
  const [typeRequiredDetails, setTypeRequiredDetails] = useState([]);
  const [discDetails, setDiscDetails] = useState([]);
  const params = useParams();
  const [disciplineLevels, setDisciplineLevels] = useState([]);
  const [disciplineName, setDisciplineName] = useState([]);
  const [loggedUser, setLoggedUser] = useState([])
  const session = supabase.auth.session()
  const loggedUsers = async () => {
    const userData = await supabase.from("admin_users").select().match({email: session['user']['email']})
    setLoggedUser(userData.data[0])
  }
  useEffect(() => {
    loggedUsers();
  }, [])
  const getDisciplineLevels = async () => {
    const { data } = await supabase
      .from("cms_disciplines_leveldetails")
      .select()
      .match({ discipline_id: params.id });
    if (data) {
      setDisciplineLevels(data);
    }
  };
  const getDisciplineName = async () => {
    const { data } = await supabase
      .from("cms_disciplines")
      .select(
        ` *, cms_disciplines_leveldetails (
      level
    )`
      )
      .match({ id: params.id });
    
    if (data) {
      setDisciplineName(data);
    }
  };
  const columns = [
    {
      name: "#",
      cell: (row, index) => index + 1,
    },
    {
      name: "Disziplinebene",
      selector: (row) => row.level,
      sortable: true,
    },
    {
      name: "Level-Bild",
      cell: (row) => (
        <div className="py-2">
          <img src={row.image} alt="" style={{ borderRadius: '50%', height: '80px', width: '80px' }} />
        </div>
      ),
    },
    {
      name: "Beschreibung",
      selector: (row) => row.desc_short,
      sortable: true,
    },
    {
      name: "Erstellungsdatum",
      selector: (row) => format(new Date(row.created_at), "yyyy-MM-dd"),
      sortable: true,
    },
    {
      name: "Aktion",
      cell: (row) => (
        <div className="d-flex action-btn-main">
          <div className="mx-1">
            <EditIcon
              onClick={() => {
                history.push(`${params.id}/${row.id}`);
              }}
            />
          </div>
        </div>
      ),
    },
  ];
  useEffect(() => {
    getEditData();
    getDisciplineLevels();
    getDisciplineName();
  }, []);

  const getEditData = async () => {
    const { data, error } = await supabase
      .from("cms_disciplines")
      .select()
      .match({ id: params.id });
    setDiscDetails({
      name: data[0].discipline_name,
      type: data[0].discipline_type,
    });
    setLoading(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (discDetails.name == "") {
      const discError = "Name der Disziplin ist erforderlich.";
      setDiscRequiredDetails(discError);
    } else {
      setLoading(true);
      const existDisc = await supabase
        .from("cms_disciplines")
        .select()
        .match({ discipline_name: discDetails.name });
      if (existDisc.data[0]) {
        const discError = "Diese Disziplin ist bereits vorhanden.";
        setDiscRequiredDetails(discError);
        setLoading(false);
      } else {
        if (discDetails.type === "" || !discDetails.type) {
          const typeError = "Disziplintyp ist erforderlich.";
          setTypeRequiredDetails(typeError);
          setLoading(false);
        } else {
          const { data, error } = await supabase
            .from("cms_disciplines")
            .update([
              {
                discipline_name: discDetails.name,
              },
            ])
            .match({ id: params.id });
          if (error) {
            toast.error("Etwas ist schief gelaufen");
            setLoading(false);
          } else {
            const levelDiscData = await supabase
              .from("cms_disciplines_leveldetails")
              .select()
              .match({ discipline_id: params.id });
            if (levelDiscData.data[0]) {
              await supabase
                .from("disciplines_completed")
                .update([
                  {
                    discipline_name: discDetails.name,
                  },
                ])
                .match({ discipline_level_id: levelDiscData.data[0].id });
            }
            if (data) {
              const activeDicsData = await supabase
                .from("cms_disciplines")
                .select()
                .match({ id: params.id });
              await supabase
                .from("admin_logs")
                .insert([
                  {
                    module: "Discipline",
                    log_type: "Updated",
                    log_desc:
                      loggedUser.firstname +
                      " has updated discipline " +
                      activeDicsData.data[0].discipline_name,
                    admin_id: loggedUser.id,
                  },
                ])
                .single();
              history.push("/disciplinelist");
              setLoading(false);
              toast.success("Disziplin erfolgreich aktualisiert")
            }
          }
        }
        setLoading(false);
      }
    }
  };

  const getEditRights = async () => {
    setLoading(true);
    const userData = await supabase.from("admin_users").select().match({email: session['user']['email']})
    const adminRole = await supabase
      .from("admin_users")
      .select()
      .match({ id: userData.data[0].id });
    const { data } = await supabase.from("admin_rights").select().match({
      role_id: adminRole.data[0].role_id,
      page_id: 3,
    });
    if (data[0].edit_rights != 1) {
      setIsEdit(false);
      setLoading(false);
    } else {
      getEditData();
    }
  };
  useEffect(() => {
    getEditRights();
  }, []);

  if (!loading) {
    return (
      <>
        {isEdit ? (
          <div>
            <Card border="light" className="bg-white shadow-sm mb-4 mt-6 w-50">
              <Card.Body>
                <h5 className="mb-4">Disziplin bearbeiten</h5>
                <Form
                  onSubmit={(e) => {
                    handleSubmit(e);
                  }}
                >
                  <Row>
                    <Col md={12} className="mb-3">
                      <Form.Group id="name">
                        <Form.Label>Name der Disziplin</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Name der Disziplin"
                          value={discDetails.name}
                          onChange={(e) => {
                            setDiscDetails({
                              ...discDetails,
                              name: e.target.value,
                            });
                          }}
                        />
                        {discRequiredDetails != "" && (
                          <span className="text-danger">
                            {discRequiredDetails}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="mt-3">
                    {!loading ? (
                      <Button variant="primary" type="submit" className="w-100">
                        Disziplin bearbeiten
                      </Button>
                    ) : (
                      <Button variant="primary" type="submit" className="w-100">
                        <Spinner animation="border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </Spinner>
                      </Button>
                    )}
                  </div>
                </Form>
              </Card.Body>
            </Card>
            <DataTable
              title={disciplineName.discipline_name}
              fixedHeader
              columns={columns}
              data={disciplineLevels}
              pagination
              highlightOnHover
            />
          </div>
        ) : (
          <AccessDenied />
        )}
      </>
    );
  } else {
    return <PreLoader />;
  }
}
