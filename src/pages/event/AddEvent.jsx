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

export default function AddEvent() {
  document.title = "Fitness | Ereignis hinzufügen";
  const state = useSelector((state) => state);
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const [isAdd, setIsAdd] = useState(true);
  let eventDetailsInitialState = {
    name: "",
    type: "",
    a: "",
    b: "",
    c: "",
  };
  const [eventDetails, setEventDetails] = useState({
    name: "",
    type: "",
    a: "",
    b: "",
    c: "",
  });
  const [eventValidationError, setEventValidationError] = useState({
    name: "",
    type: "",
    a: "",
    b: "",
    c: "",
  });
  let validation_errors = {
    name: "Das Feld für den Titel des Ereignisses ist erforderlich.",
    type: "Das Feld für den Ereignistyp ist erforderlich.",
    a: "Das Feld für den A ist erforderlich.",
    b: "Das Feld für den B ist erforderlich..",
    c: "Das Feld für den C ist erforderlich..",
  };
  const [loggedUser, setLoggedUser] = useState([])
  const session = supabase.auth.session()
  const loggedUsers = async () => {
    const userData = await supabase.from("admin_users").select().match({email: session['user']['email']})
    setLoggedUser(userData.data[0])
  }
  useEffect(() => {
    loggedUsers();
  }, [])
  const validateForm = () => {
    let isValidate = true;
    let isAllFilled = true;

    let new_er = eventDetailsInitialState;
    Object.keys(eventValidationError).forEach((key) => {
      if (eventDetails[key] == "") {
        isValidate = false;
        isAllFilled = false;
        new_er = {
          ...new_er,
          [key]: validation_errors[key],
        };
      }
    });
    setEventValidationError(new_er);
    return isValidate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);

      const { data, error } = await supabase
        .from("events")
        .insert([
          {
            name: eventDetails.name,
            type: eventDetails.type,
            a: eventDetails.a,
            b: eventDetails.b,
            c: eventDetails.c,
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
                module: "Event",
                log_type: "Created",
                log_desc:
                  loggedUser.firstname +
                  " has created event " +
                  eventDetails.name,
                admin_id: loggedUser.id,
              },
            ])
            .single();
          history.push("/events");
          toast.success("Veranstaltung erfolgreich hinzugefügt");
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
      .match({ role_id: adminRole.data[0].role_id, page_id: 5 });
    if (data[0].add_rights !== 1) {
      setLoading(false);
      setIsAdd(false);
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
            <Card border="light" className="bg-white shadow-sm mb-4 mt-6 w-50">
              <Card.Body>
                <h5 className="mb-4">
                  {/* Add User */}
                  Ereignis hinzufügen
                </h5>
                <Form
                  onSubmit={(e) => {
                    handleSubmit(e);
                  }}
                >
                  <Row>
                    <Col md={12} className="mb-3">
                      <Form.Group id="event-name">
                        <Form.Label>Titel</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Veranstaltungsname"
                          defaultValue={eventDetails.name}
                          onChange={(e) => {
                            setEventDetails({
                              ...eventDetails,
                              name: e.target.value,
                            });
                          }}
                        />
                        {eventValidationError.name !== "" && (
                          <span className="text-danger">
                            {eventValidationError.name}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={12} className="mb-3">
                      <Form.Group id="type">
                        <Form.Label>Typ</Form.Label>
                        <Form.Select
                          // defaultValue={eventDetails.type}
                          defaultValue={eventDetails.type == 0 ? "" : eventDetails.type}
                          onChange={(e) => {
                            setEventDetails({
                              ...eventDetails,
                              type: e.target.value,
                            });
                          }}
                        >
                          <option value="">Art auswählen</option>
                          <option value="time">Zeit</option>
                          <option value="disctance">Distanz</option>
                        </Form.Select>
                        {eventValidationError.type !== "" && (
                          <span className="text-danger">
                            {eventValidationError.type}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="align-items-center">
                    <Col md={4} className="mb-3">
                      <Form.Group id="event-name">
                        <Form.Label>A </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder=""
                          defaultValue={eventDetails.a}
                          onChange={(e) => {
                            setEventDetails({
                              ...eventDetails,
                              a: e.target.value,
                            });
                          }}
                        />
                        {eventValidationError.a !== "" && (
                          <span className="text-danger">
                            {eventValidationError.a}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={4} className="mb-3">
                      <Form.Group id="event-name">
                        <Form.Label>B</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder=""
                          defaultValue={eventDetails.b}
                          onChange={(e) => {
                            setEventDetails({
                              ...eventDetails,
                              b: e.target.value,
                            });
                          }}
                        />
                        {eventValidationError.b !== "" && (
                          <span className="text-danger">
                            {eventValidationError.b}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={4} className="mb-3">
                      <Form.Group id="event-name">
                        <Form.Label>C</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder=""
                          defaultValue={eventDetails.c}
                          onChange={(e) => {
                            setEventDetails({
                              ...eventDetails,
                              c: e.target.value,
                            });
                          }}
                        />
                        {eventValidationError.c !== "" && (
                          <span className="text-danger">
                            {eventValidationError.c}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="mt-3">
                    {!loading ? (
                      <Button variant="primary" type="submit" className="w-100">
                        Ereignis hinzufügen
                        {/* Nutzer hinzufügen */}
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
