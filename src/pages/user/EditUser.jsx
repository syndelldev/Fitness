import React, { useState, useEffect } from "react";
import PreLoader from "../widgets/PreLoader";
import AccessDenied from "../widgets/AccessDenied";
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

export default function EditUser() {
  document.title = "Fitness | Benutzer bearbeiten";
  const state = useSelector((state) => state);
  const [userDetails, setUserDetails] = useState([]);
  const [isEdit, setIsEdit] = useState(true);
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const [loggedUser, setLoggedUser] = useState([])
  const session = supabase.auth.session()
  const loggedUsers = async () => {
    const userData = await supabase.from("admin_users").select().match({email: session['user']['email']})
    setLoggedUser(userData.data[0])
  }
  useEffect(() => {
    loggedUsers();
  }, [])

  let email_pattern =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const history = useHistory();
  let userDetailsInitialState = {
    firstname: "",
    lastname: "",
    gender: "",
    username: "",
    phone: "",
    email: "",
    // invcode: "",
    coach_points: "",
    // password: "",
  };
  const getEditData = async () => {
    const { data, error } = await supabase
      .from("users")
      .select()
      .match({ id: params.id });
    setUserDetails({
      firstname: data[0].firstname,
      lastname: data[0].lastname,
      username: data[0].username,
      phone: data[0].phone,
      email: data[0].email,
      gender: data[0].gender,
      // invcode: data[0].invcode,
      // password: data[0].password,
      coach_points: data[0].coach_points,
    });
    setLoading(false);
  };
  const getEditRights = async () => {
    const userData = await supabase.from("admin_users").select().match({email: session['user']['email']})
    setLoading(true);
    const adminRole = await supabase
      .from("admin_users")
      .select()
      .match({ id: userData.data[0].id });
    const { data } = await supabase.from("admin_rights").select().match({
      role_id: adminRole.data[0].role_id,
      page_id: 1,
      // edit_rights: 1,
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
  const [userValidationError, setUserValidationError] = useState({
    firstname: "",
    lastname: "",
    gender: "",
    username: "",
    phone: "",
    email: "",
    // invcode: "",
    coach_points: "",
    // password: "",
  });
  let validation_errors = {
    firstname: "Das Feld Vorname ist erforderlich.",
    lastname: "Das Feld Nachname ist erforderlich.",
    gender: "Das Feld „Geschlecht“ ist erforderlich.",
    username: "Das Feld Benutzername ist erforderlich.",
    phone: "Telefonfeld ist erforderlich.",
    email: "E-Mail-Feld ist erforderlich.",
    // invcode: "Das Feld für den Einladungscode ist erforderlich.",
    coach_points: "Das Feld „Offizieller Punkt“ ist erforderlich.",
    // password: "Passwortfeld ist erforderlich.",
    email_not_validate: "Diese E-Mail ist ungültig.",
  };
  const validateForm = () => {
    let isValidate = true;
    let isAllFilled = true;

    let new_er = userDetailsInitialState;
    Object.keys(userValidationError).forEach((key) => {
      if (userDetails[key] == "") {
        isValidate = false;
        isAllFilled = false;
        new_er = {
          ...new_er,
          [key]: validation_errors[key],
        };
      }
    });
    if (isAllFilled) {
      if (userDetails.email != "") {
        if (!userDetails.email.match(email_pattern)) {

          isValidate = false;
          new_er = {
            ...new_er,
            email: validation_errors.email_not_validate,
          };
        }
      }
    }
    setUserValidationError(new_er);
    return isValidate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .update([
          {
            firstname: userDetails.firstname,
            lastname: userDetails.lastname,
            email: userDetails.email,
            username: userDetails.username,
            // password: userDetails.password,
            gender: userDetails.gender,
            phone: userDetails.phone,
            coach_points: userDetails.coach_points,
            // invcode: userDetails.invcode,
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
                module: "User",
                log_type: "Updated",
                log_desc:
                  loggedUser.firstname +
                  " has updated user " +
                  userDetails.firstname,
                admin_id: loggedUser.id,
              },
            ])
            .single();
          history.push("/userlist");
          toast.success("Benutzer erfolgreich aktualisiert");
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
                <h5 className="mb-4">
                  {/* Edit User */}
                  Benutzer bearbeiten
                </h5>
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
                          placeholder="Vorname"
                          defaultValue={userDetails.firstname}
                          onChange={(e) => {
                            setUserDetails({
                              ...userDetails,
                              firstname: e.target.value,
                            });
                          }}
                        />
                        {userValidationError.firstname != "" && (
                          <span className="text-danger">
                            {userValidationError.firstname}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group id="lastName">
                        <Form.Label>Nachname</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Nachname"
                          defaultValue={userDetails.lastname}
                          onChange={(e) => {
                            setUserDetails({
                              ...userDetails,
                              lastname: e.target.value,
                            });
                          }}
                        />
                        {userValidationError.lastname != "" && (
                          <span className="text-danger">
                            {userValidationError.lastname}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="align-items-center">
                    <Col md={6} className="mb-3">
                      <Form.Group id="gender">
                        <Form.Label>Geschlecht</Form.Label>
                        <Form.Select
                          defaultValue={userDetails.gender}
                          onChange={(e) => {
                            setUserDetails({
                              ...userDetails,
                              gender: e.target.value,
                            });
                          }}
                        >
                          <option value="">Wähle Geschlecht</option>
                          <option value="Männlich">Männlich</option>
                          <option value="Weiblich">Weiblich</option>
                        </Form.Select>
                        {userValidationError.gender != "" && (
                          <span className="text-danger">
                            {userValidationError.gender}
                          </span>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={6} className="mb-3">
                      <Form.Group id="username">
                        <Form.Label>Benutzername</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Benutzername"
                          defaultValue={userDetails.username}
                          onChange={(e) => {
                            setUserDetails({
                              ...userDetails,
                              username: e.target.value,
                            });
                          }}
                        />
                        {userValidationError.username != "" && (
                          <span className="text-danger">
                            {userValidationError.username}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group id="phone">
                        <Form.Label>Telefonnummer</Form.Label>
                        <Form.Control
                          type="text"
                          defaultValue={userDetails.phone}
                          placeholder="Telefonnummer"
                          onChange={(e) => {
                            setUserDetails({
                              ...userDetails,
                              phone: e.target.value,
                            });
                          }}
                        />
                        {userValidationError.phone != "" && (
                          <span className="text-danger">
                            {userValidationError.phone}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                    {/* <Col md={6} className="mb-3">
                      <Form.Group id="invcode">
                        <Form.Label>Einladungscode</Form.Label>
                        <Form.Control
                          type="text"
                          defaultValue={userDetails.invcode}
                          placeholder="Einladungscode"
                          onChange={(e) => {
                            setUserDetails({
                              ...userDetails,
                              invcode: e.target.value,
                            });
                          }}
                        />
                        {userValidationError.invcode != "" && (
                          <span className="text-danger">
                            {userValidationError.invcode}
                          </span>
                        )}
                      </Form.Group>
                    </Col> */}
                    <Col md={6} className="mb-3">
                      <Form.Group id="official-point">
                        <Form.Label>Offizielle Punkte</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Offizielle Punkte"
                          defaultValue={userDetails.coach_points}
                          onChange={(e) => {
                            setUserDetails({
                              ...userDetails,
                              coach_points: e.target.value,
                            });
                          }}
                        />
                        {userValidationError.coach_points != "" && (
                          <span className="text-danger">
                            {userValidationError.coach_points}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group id="email">
                        <Form.Label>E-Mail-Addresse</Form.Label>
                        <Form.Control
                          type="text"
                          defaultValue={userDetails.email}
                          placeholder="E-Mail-Addresse"
                          onChange={(e) => {
                            setUserDetails({
                              ...userDetails,
                              email: e.target.value,
                            });
                          }}
                        />
                        {userValidationError.email != "" && (
                          <span className="text-danger">
                            {userValidationError.email}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                    {/* <Col md={6} className="mb-3">
                      <Form.Group id="password">
                        <Form.Label>Passwort</Form.Label>
                        <Form.Control
                          type="password"
                          defaultValue={userDetails.password}
                          onChange={(e) => {
                            setUserDetails({
                              ...userDetails,
                              password: e.target.value,
                            });
                          }}
                          placeholder="Passwort"
                        />
                        {userValidationError.password != "" && (
                          <span className="text-danger">
                            {userValidationError.password}
                          </span>
                        )}
                      </Form.Group>
                    </Col> */}
                  </Row>
                  <div className="mt-3">
                    {!loading ? (
                      <Button variant="primary" type="submit" className="w-100">
                        {/* Update User */}
                        Benutzer aktualisieren
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
