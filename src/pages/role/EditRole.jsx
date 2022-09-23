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
import { useHistory, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

export default function EditRole() {
  document.title = 'Fitness | Rolle bearbeiten'
  const state = useSelector((state) => state);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(true);
  const history = useHistory();
  let [roleRequiredDetails, setRoleRequiredDetails] = useState([]);
  const [roleDetails, setRoleDetails] = useState([]);
  const params = useParams();
  const [roleName, setRoleName] = useState([])
  const [loggedUser, setLoggedUser] = useState([])
  const session = supabase.auth.session()
  const loggedUsers = async () => {
    const userData = await supabase.from("admin_users").select().match({email: session['user']['email']})
    setLoggedUser(userData.data[0])
  }
  useEffect(() => {
    loggedUsers();
  }, [])

  const getRoleName = async () => {
    const { data, error } = await supabase.from("admin_roles").select().match({id: params.id});
   if(data){
    setRoleName(data);
   }
  };


  const getEditData = async () => {
    const { data, error } = await supabase
      .from("admin_roles")
      .select()
      .match({ id: params.id });
    setRoleDetails({
      name: data[0].name,
    });
    setLoading(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (roleDetails.name === "") {
      const roleError = "Rollenname ist erforderlich.";
      setRoleRequiredDetails(roleError);
    } else {
      setLoading(true);
      const existRole = await supabase
        .from("admin_roles")
        .select()
        .match({ name: roleDetails.name });
      if (existRole.data[0]) {
        const roleError = "Diese Rolle ist bereits vorhanden.";
        setRoleRequiredDetails(roleError);
        setLoading(false);
      } else {
        const { data, error } = await supabase
          .from("admin_roles")
          .update([
            {
              name: roleDetails.name,
            },
          ])
          .match({ id: params.id });
        if (error) {
          toast.error("Etwas ist schief gelaufen");
          setLoading(false);
        } 
          if (data) {
            await supabase
              .from("admin_logs")
              .insert([
                {
                  module: "Role",
                  log_type: "Updated",
                  log_desc:
                    loggedUser.firstname +
                    " has updated role " +
                    data[0].name,
                  admin_id: loggedUser.id,
                },
              ])
              .single();
            history.push("/rolelist");
            toast.success("Rolle erfolgreich aktualisiert")
          }
        }
        setLoading(false);
      }
    }

  const getEditRights = async () => {
    setLoading(true);
    const userData = await supabase.from("admin_users").select().match({email: session['user']['email']})
    const adminRole = await supabase
      .from("admin_users")
      .select()
      .match({ id: userData.data[0].id });
    const { data } = await supabase.from("admin_rights").select().match({
      role_id: adminRole.data[0].role_id,
      page_id: 5,
    });
    if (data[0].edit_rights != 1) {
      setIsEdit(false);
      setLoading(false);
    } else {
      getEditData();
      getRoleName();
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
          <Card border="light" className="bg-white shadow-sm mb-4 mt-6">
            <Card.Body>
              <h5 className="mb-4">Rolle bearbeiten</h5>
              <Form
                className="w-50"
                onSubmit={(e) => {
                  handleSubmit(e);
                }}
              >
                <Row>
                  <Col md={12} className="mb-3">
                    <Form.Group id="name">
                      <Form.Label>Rollenname</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Rollenname"
                        value={roleDetails.name}
                        onChange={(e) => {
                          setRoleDetails({
                            ...roleDetails,
                            name: e.target.value,
                          });
                        }}
                      />
                      {roleRequiredDetails != "" && (
                        <span className="text-danger">
                          {roleRequiredDetails}
                        </span>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                <div className="mt-3">
                  {!loading ? (
                    <Button variant="primary" type="submit" className="w-100">
                      Rolle aktualisieren
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
     return (
      <PreLoader/>
     );
   }
}
 