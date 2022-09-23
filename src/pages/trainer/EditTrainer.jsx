import React, { useState, useEffect } from "react";

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
import AccessDenied from "../widgets/AccessDenied";
import PreLoader from "../widgets/PreLoader";
import { toast } from "react-toastify";

export default function EditTrainer() {
  document.title = 'Fitness | Trainer bearbeiten'
  const state = useSelector((state) => state);
  let email_pattern =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState([]);
  const [allRole, setAllRole] = useState([]);
  const params = useParams();
  const [trainerDetails, setTrainerDetails] = useState([]);
  const [loggedUser, setLoggedUser] = useState([])
  const session = supabase.auth.session()
  const loggedUsers = async () => {
    const userData = await supabase.from("admin_users").select().match({email: session['user']['email']})
    setLoggedUser(userData.data[0])
  }
  useEffect(() => {
    loggedUsers();
  }, [])
  const history = useHistory();
  const getAllRoles = async () => {
    const { data, error } = await supabase.from("admin_roles").select();
    setAllRole(data);
  };
  useEffect(() => {
    getAllRoles();
  }, []);
  let trainerDetailsInitialState = {
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    // password: "",
    role: "",
  };

  const getEditData = async () => {
    const { data, error } = await supabase
      .from("admin_users")
      .select()
      .match({ id: params.id });
    setTrainerDetails({
      firstname: data[0].firstname,
      lastname: data[0].lastname,
      username: data[0].username,
      email: data[0].email,
      // password: data[0].password,
      role: data[0].role_id,
    });
    setLoading(false);
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
      page_id: 2,
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
  const [trainerValidationError, setTrainerValidationError] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    // password: "",
    role: "",
  });
  let validation_errors = {
    firstname: "Das Feld Vorname ist erforderlich.",
    lastname: "Das Feld Nachname ist erforderlich.",
    username: "Das Feld Benutzername ist erforderlich.",
    email: "E-Mail-Feld ist erforderlich.",
    role: "Rollenfeld ist erforderlich.",
    // password: "Passwortfeld ist erforderlich.",
    email_not_validate: "Diese E-Mail ist ungültig.",
  };

  const validateForm = () => {
    let isValidate = true;
    let isAllFilled = true;

    let new_er = trainerDetailsInitialState;
    Object.keys(trainerValidationError).forEach((key) => {
      if (trainerDetails[key] == "") {
        isValidate = false;
        isAllFilled = false;
        new_er = {
          ...new_er,
          [key]: validation_errors[key],
        };
      }
    });
    if (isAllFilled) {
      if (trainerDetails.email != "") {
        if (!trainerDetails.email.match(email_pattern)) {
          isValidate = false;
          new_er = {
            ...new_er,
            email: validation_errors.email_not_validate,
          };
        }
      }
    }
    setTrainerValidationError(new_er);
    return isValidate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      const { data, error } = await supabase
        .from("admin_users")
        .update([
          {
            firstname: trainerDetails.firstname,
            lastname: trainerDetails.lastname,
            email: trainerDetails.email,
            username: trainerDetails.username,
            // password: trainerDetails.password,
            role_id: trainerDetails.role,
          },
        ])
        .match({ id: params.id });
      if (error) {
        toast.error("Etwas ist schief gelaufen");
        setLoading(false);
      } else {
        if (data) {
          await supabase
            .from("admin_logs")
            .insert([
              {
                module: "Trainer",
                log_type: "Updated",
                log_desc:
                  loggedUser.firstname +
                  " has updated trainer " +
                  trainerDetails.firstname,
                admin_id: loggedUser.id,
              },
            ])
            .single();
          history.push("/trainerlist");
          toast.success("Trainer erfolgreich aktualisiert")
        }
      }
      setLoading(false);
    }
  };

  if (!loading) {
    return (
      <>
        {isEdit ? (
          <div>
            <Card border="light" className="bg-white shadow-sm mb-4 mt-6">
              <Card.Body>
                <h5 className="mb-4">Trainer bearbeiten</h5>
                <Form
                  onSubmit={(e) => {
                    handleSubmit(e);
                  }}
                >
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group id="firstName">
                        <Form.Label>Vorname</Form.Label>
                        <Form.Control
                          type="text"
                          defaultValue={trainerDetails.firstname}
                          placeholder="Vorname"
                          onChange={(e) => {
                            setTrainerDetails({
                              ...trainerDetails,
                              firstname: e.target.value,
                            });
                          }}
                        />
                        {trainerValidationError.firstname != "" && (
                          <span className="text-danger">
                            {trainerValidationError.firstname}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group id="lastName">
                        <Form.Label>Nachname</Form.Label>
                        <Form.Control
                          type="text"
                          defaultValue={trainerDetails.lastname}
                          placeholder="Nachname"
                          onChange={(e) => {
                            setTrainerDetails({
                              ...trainerDetails,
                              lastname: e.target.value,
                            });
                          }}
                        />
                        {trainerValidationError.lastname != "" && (
                          <span className="text-danger">
                            {trainerValidationError.lastname}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="align-items-center">
                    <Col md={6} className="mb-3">
                      <Form.Group id="username">
                        <Form.Label>Benutzername</Form.Label>
                        <Form.Control
                          type="text"
                          defaultValue={trainerDetails.username}
                          placeholder="Benutzername"
                          onChange={(e) => {
                            setTrainerDetails({
                              ...trainerDetails,
                              username: e.target.value,
                            });
                          }}
                        />
                        {trainerValidationError.username != "" && (
                          <span className="text-danger">
                            {trainerValidationError.username}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group id="email">
                        <Form.Label>E-Mail-Addresse</Form.Label>
                        <Form.Control
                          type="text"
                          defaultValue={trainerDetails.email}
                          placeholder="E-Mail-Addresse"
                          onChange={(e) => {
                            setTrainerDetails({
                              ...trainerDetails,
                              email: e.target.value,
                            });
                          }}
                        />
                        {trainerValidationError.email != "" && (
                          <span className="text-danger">
                            {trainerValidationError.email}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    {/* <Col md={6} className="mb-3">
                      <Form.Group id="password">
                        <Form.Label>Passwort</Form.Label>
                        <Form.Control
                          type="password"
                          defaultValue={trainerDetails.password}
                          onChange={(e) => {
                            setTrainerDetails({
                              ...trainerDetails,
                              password: e.target.value,
                            });
                          }}
                          placeholder="Passwort"
                        />
                        {trainerValidationError.password != "" && (
                          <span className="text-danger">
                            {trainerValidationError.password}
                          </span>
                        )}
                      </Form.Group>
                    </Col> */}
                    <Col md={6} className="mb-3">
                      <Form.Group id="role">
                        <Form.Label>Rolle</Form.Label>
                        <Form.Select
                          defaultValue={trainerDetails.role}
                          onChange={(e) => {
                            setTrainerDetails({
                              ...trainerDetails,
                              role: e.target.value,
                            });
                          }}
                        >
                          <option>Rolle auswählen</option>
                          {allRole.map((role) => (
                            <option value={role.id}>{role.name}</option>
                          ))}
                        </Form.Select>
                        {trainerValidationError.role != "" && (
                          <span className="text-danger">
                            {trainerValidationError.role}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="mt-3">
                    {!loading ? (
                      <Button variant="primary" type="submit" className="w-100">
                        Trainer bearbeiten
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
      <PreLoader />
    );
  }
}
