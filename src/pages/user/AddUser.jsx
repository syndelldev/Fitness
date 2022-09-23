import React, { useState, useEffect } from "react";
import AccessDeniedImage from "../../assets/img/access-denied-img.jpg";
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

export default function AddUser() {
  const state = useSelector((state) => state);
  let email_pattern =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const [loading, setLoading] = useState(false);
  const [isAdd, setIsAdd] = useState(true);
  const history = useHistory();
  const [invcodeExists, setInvcodeExists] = useState([]);
  const [emailExists, setEmailExists] = useState([]);
  const [loggedUser, setLoggedUser] = useState([])
  const session = supabase.auth.session()
  const loggedUsers = async () => {
    const userData = await supabase.from("admin_users").select().match({email: session['user']['email']})
    setLoggedUser(userData.data[0])
  }
  useEffect(() => {
    loggedUsers();
  }, [])

  let userDetailsInitialState = {
    firstname: "",
    lastname: "",
    gender: "",
    username: "",
    phone: "",
    email: "",
    invcode: "",
    // coach_points: "",
    password: "",
  };
  const [userDetails, setUserDetails] = useState({
    firstname: "",
    lastname: "",
    gender: "",
    username: "",
    phone: "",
    email: "",
    invcode: "",
    // coach_points: "",
    password: "",
  });
  const [userValidationError, setUserValidationError] = useState({
    firstname: "",
    lastname: "",
    gender: "",
    username: "",
    phone: "",
    email: "",
    invcode: "",
    // coach_points: "",
    password: "",
  });
  let validation_errors = {
    firstname: "Das Feld Vorname ist erforderlich.",
    lastname: "Das Feld Nachname ist erforderlich.",
    gender: "Das Feld „Geschlecht“ ist erforderlich.",
    username: "Das Feld Benutzername ist erforderlich.",
    phone: "Telefonfeld ist erforderlich.",
    email: "E-Mail-Feld ist erforderlich.",
    invcode: "Das Feld für den Einladungscode ist erforderlich.",
    // coach_points: "Coach Points field is required.",
    password: "Passwortfeld ist erforderlich.",
    email_not_validate: "Diese E-Mail ist ungültig.",
  };

  const validateForm = () => {
    let isValidate = true;
    let isAllFilled = true;

    let new_er = userDetailsInitialState;
    Object.keys(userValidationError).forEach((key) => {
      if (userDetails[key] === "") {
        isValidate = false;
        isAllFilled = false;
        new_er = {
          ...new_er,
          [key]: validation_errors[key],
        };
      }
    });
    if (isAllFilled) {
      if (userDetails.email !== "") {
        if (!userDetails.email.match(email_pattern)) {
          console.log(userDetails.email);
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
      const existEmail = await supabase
        .from("users")
        .select()
        .match({ email: userDetails.email });
      if (existEmail.data.length) {
        const emailExistError = "Diese E-Mail existiert bereits.";
        setEmailExists(emailExistError);
      } else {
        if (userDetails.invcode.length !== 5) {
          const invcodeExistError = "Akzeptieren Sie eine Länge von 5 Ziffern.";
          setInvcodeExists(invcodeExistError);
        } else {
          const existInvcode = await supabase
            .from("users")
            .select()
            .match({ invcode: userDetails.invcode });
          if (existInvcode.data.length) {
            const invcodeExistError = "Dieser Einladungscode ist bereits vorhanden.";
            setInvcodeExists(invcodeExistError);
          } else {
            setLoading(true)
            const { data, error } = await supabase
              .from("users")
              .insert([
                {
                  firstname: userDetails.firstname,
                  lastname: userDetails.lastname,
                  email: userDetails.email,
                  username: userDetails.username,
                  // password: userDetails.password,
                  gender: userDetails.gender,
                  phone: userDetails.phone,
                  // coach_points: userDetails.coach_points,
                  invcode: userDetails.invcode,
                },
              ])
              .single();
              let { user } = await supabase.auth.signUp({
                email: userDetails.email,
                password: userDetails.password
              })
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
                      log_type: "Created",
                      log_desc:
                        loggedUser.firstname +
                        " has created user " +
                        userDetails.firstname,
                      admin_id: loggedUser.id,
                    },
                  ])
                  .single();
                history.push("/userlist");
                toast.success("Benutzer erfolgreich hinzugefügt");
              }
            }
          }
        }
      }

      setLoading(false);
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
      .match({ role_id: adminRole.data[0].role_id, page_id: 1 });
    if (data[0].add_rights !== 1) {
      setIsAdd(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAddRights();
  }, []);
  if (!loading) {
    return (
      <>
        {isAdd ? (
          <div>
            <Card border="light" className="bg-white shadow-sm mb-4 mt-6">
              <Card.Body>
                <h5 className="mb-4">
                  {/* Add User */}
                  Nutzer hinzufügen
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
                          onChange={(e) => {
                            setUserDetails({
                              ...userDetails,
                              firstname: e.target.value,
                            });
                          }}
                        />
                        {userValidationError.firstname !== "" && (
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
                          onChange={(e) => {
                            setUserDetails({
                              ...userDetails,
                              lastname: e.target.value,
                            });
                          }}
                        />
                        {userValidationError.lastname !== "" && (
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
                          defaultValue="0"
                          onChange={(e) => {
                            setUserDetails({
                              ...userDetails,
                              gender: e.target.value,
                            });
                          }}
                        >
                          <option value="0">Wähle Geschlecht</option>
                          <option value="Männlich">Männlich</option>
                          <option value="Weiblich">Weiblich</option>
                        </Form.Select>
                        {userValidationError.gender !== "" && (
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
                          onChange={(e) => {
                            setUserDetails({
                              ...userDetails,
                              username: e.target.value,
                            });
                          }}
                        />
                        {userValidationError.username !== "" && (
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
                          type="number"
                          placeholder="Telefonnummer"
                          onChange={(e) => {
                            setUserDetails({
                              ...userDetails,
                              phone: e.target.value,
                            });
                          }}
                        />
                        {userValidationError.phone !== "" && (
                          <span className="text-danger">
                            {userValidationError.phone}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group id="invcode">
                        <Form.Label>Einladungscode</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Einladungscode"
                          onChange={(e) => {
                            setUserDetails({
                              ...userDetails,
                              invcode: e.target.value,
                            });
                          }}
                        />
                        {invcodeExists !== "" && (
                          <span className="text-danger">{invcodeExists}</span>
                        )}
                        {userValidationError.invcode !== "" && (
                          <span className="text-danger">
                            {userValidationError.invcode}
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
                          placeholder="E-Mail-Addresse"
                          onChange={(e) => {
                            setUserDetails({
                              ...userDetails,
                              email: e.target.value,
                            });
                          }}
                        />
                        {emailExists !== "" && (
                          <span className="text-danger">{emailExists}</span>
                        )}
                        {userValidationError.email !== "" && (
                          <span className="text-danger">
                            {userValidationError.email}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group id="password">
                        <Form.Label>Passwort</Form.Label>
                        <Form.Control
                          type="Passwort"
                          onChange={(e) => {
                            setUserDetails({
                              ...userDetails,
                              password: e.target.value,
                            });
                          }}
                          placeholder="Password"
                        />
                        {userValidationError.password !== "" && (
                          <span className="text-danger">
                            {userValidationError.password}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="mt-3">
                    {!loading ? (
                      <Button variant="primary" type="submit" className="w-100">
                        {/* Add User */}
                        Nutzer hinzufügen
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
          <div>
            <Card>
              <Card.Body>
                <div className="access-denied-img-section">
                  <img src={AccessDeniedImage} alt="access-denied-img" />
                </div>
              </Card.Body>
            </Card>
          </div>
        )}
      </>
    );
  } else {
    return (
      <>
        <div className="full-page-loader">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </>
    );
  }
}
