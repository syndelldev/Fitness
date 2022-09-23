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

export default function AddRole() {
  document.title = 'Fitness | Rolle hinzufügen';
  const state = useSelector((state) => state);
  const [loading, setLoading] = useState(false);
  const [isAdd, setIsAdd] = useState(true);
  const history = useHistory();
  let [roleRequiredDetails, setRoleRequiredDetails] = useState([])
  const [roleDetails, setRoleDetails] = useState({
    name: "",
    });
  const [loggedUser, setLoggedUser] = useState([])
  const session = supabase.auth.session()
  const loggedUsers = async () => {
    const userData = await supabase.from("admin_users").select().match({email: session['user']['email']})
    setLoggedUser(userData.data[0])
  }
  useEffect(() => {
    loggedUsers();
  }, [])
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (roleDetails.name == ""){
      const roleError = "Rollenname ist erforderlich."
      setRoleRequiredDetails(roleError)
    }else{
      setLoading(true);
      const existRole = await supabase
      .from("admin_roles")
      .select()
      .match({ name: roleDetails.name });
      if(existRole.data[0]){
        const roleError = "Diese Rolle ist bereits vorhanden."
        setRoleRequiredDetails(roleError)
        setLoading(false);
      }else{
        const { data, error } = await supabase
        .from("admin_roles")
        .insert([
          {
            name: roleDetails.name,
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
                  module: "Role",
                  log_type: "Created",
                  log_desc:
                    loggedUser.firstname +
                    " has created Role " +
                    roleDetails.name,
                  admin_id: loggedUser.id,
                },
              ])
              .single();
            history.push("/rolelist");
            toast.success("Rolle erfolgreich hinzugefügt")
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
      .match({ role_id: adminRole.data[0].role_id, page_id: 5 });
      if(data[0].add_rights !== 1){
        setIsAdd(false);
        setLoading(false)
      }
  };

  useEffect(() => {
    getAddRights();
  }, []);
  if(!loading){
    return (<>
      {isAdd ?   (
        <div>
          <Card border="light" className="bg-white shadow-sm mb-4 mt-6">
            <Card.Body>
              <h5 className="mb-4">Rolle hinzufügen</h5>
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
                      Rolle hinzufügen
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
     )
    } else {
      return (
        <PreLoader />
      );
    }
  }
