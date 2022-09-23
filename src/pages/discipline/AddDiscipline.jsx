import React, { useState, useEffect } from "react";
import AccessDenied from "../widgets/AccessDenied";
import PreLoader from "../widgets/PreLoader";
import {
  Col,
  Row,
  Card,
  Form,
  Button,
  Spinner,
} from "@themesberg/react-bootstrap";
import { supabase } from "../../supabaseClient";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

export default function AddDiscipline() {
  document.title = "Fitness | Disziplin hinzufügen";
  const state = useSelector((state) => state);
  const [loading, setLoading] = useState(false);
  const [isAdd, setIsAdd] = useState(true);
  const history = useHistory();
  const [discRequiredDetails, setDiscRequiredDetails] = useState([]);
  const [typeRequiredDetails, setTypeRequiredDetails] = useState([]);
  const [allType, setAllType] = useState([]);
  const [discDetails, setDiscDetails] = useState({
    name: "",
    type: ""
  });
  const [loggedUser, setLoggedUser] = useState([]);
  const session = supabase.auth.session();
  const loggedUsers = async () => {
    const userData = await supabase
      .from("admin_users")
      .select()
      .match({ email: session["user"]["email"] });
    setLoggedUser(userData.data[0]);
  };
  useEffect(() => {
    loggedUsers();
  }, []);
  const getAllTypes = async () => {
    const { data, error } = await supabase
      .from("cms_discipline_type")
      .select()
      .match({ status: 1 });
    setAllType(data);
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
            .insert([
              {
                discipline_name: discDetails.name,
                discipline_type: discDetails.type
              },
            ])
            .single();
          if (error) {
            toast.error("Etwas ist schief gelaufen");
            setLoading(false);
          } else {
            if (data) {
              await supabase
                .from("admin_logs")
                .insert([
                  {
                    module: "Discipline",
                    log_type: "Created",
                    log_desc:
                      loggedUser.firstname +
                      " has created discipline " +
                      discDetails.name,
                    admin_id: loggedUser.id,
                  },
                ])
                .single();
              history.push("/disciplinelist");
              toast.success("Disziplin erfolgreich hinzugefügt")
            }
          }
        }
        setLoading(false);
      }
    }
  };

  const getAddRights = async () => {
    const userData = await supabase.from("admin_users").select().match({email: session['user']['email']})
    const adminRole = await supabase
      .from("admin_users")
      .select()
      .match({ id: userData.data[0].id });
    const { data } = await supabase
      .from("admin_rights")
      .select()
      .match({ role_id: adminRole.data[0].role_id, page_id: 3 });
    if (data[0].add_rights !== 1) {
      setIsAdd(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAddRights();
    getAllTypes();
  }, []);

  if (!loading) {
    return (
      <>
        {isAdd ? (
          <div>
            <Card border="light" className="bg-white shadow-sm mb-4 mt-6 w-50">
              <Card.Body>
                <h5 className="mb-4">Disziplin hinzufügen</h5>
                <Form
                  className=""
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
                          defaultValue={discDetails.name}
                          placeholder="Name der Disziplin"
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
                        Disziplin hinzufügen
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
