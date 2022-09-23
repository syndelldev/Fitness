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
  document.title = "Fitness | Edit Event";
  const state = useSelector((state) => state);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState([]);
  const params = useParams();
  const [eventDetails, setEventDetails] = useState([]);
  const history = useHistory();

  let eventDetailsInitialState = {
    name: "",
    type: "",
    a: "",
    b: "",
    c: "",
  };

  const getEditData = async () => {
    const { data, error } = await supabase
      .from("events")
      .select()
      .match({ id: params.id });

    setEventDetails({
      name: data[0].name,
      type: data[0].type,
      a: data[0].a,
      b: data[0].b,
      c: data[0].c,
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
      page_id: 5,
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
  const [eventValidationError, setEventValidationError] = useState({
    name: "",
    type: "",
    a: "",
    b: "",
    c: "",
  });
  let validation_errors = {
    name: "Event title field is required.",
    type: "Event type field is required.",
    a: "A field is required for calculation.",
    b: "B field is required for calculation.",
    c: "C field is required for calculation.",
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
        .update([
          {
            name: eventDetails.name,
            type: eventDetails.type,
            a: eventDetails.a,
            b: eventDetails.b,
            c: eventDetails.c,
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
                module: "Event",
                log_type: "Updated",
                log_desc:
                  loggedUser.firstname +
                  " has updated event " +
                  eventDetails.name,
                admin_id: loggedUser.id,
              },
            ])
            .single();
          history.push("/events");
          toast.success("Veranstaltung erfolgreich aktualisiert");
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
            <Card border="light" className="bg-white shadow-sm mb-4 mt-6 w-50">
              <Card.Body>
                <h5 className="mb-4">
                  {/* Add User */}
                  Add Event
                </h5>
                <Form
                  onSubmit={(e) => {
                    handleSubmit(e);
                  }}
                >
                  <Row>
                    <Col md={12} className="mb-3">
                      <Form.Group id="event-name">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Event Name"
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
                        <Form.Label>Type</Form.Label>
                        <Form.Select
                        
                          defaultValue={eventDetails.type}
                          onChange={(e) => {
                            setEventDetails({
                              ...eventDetails,
                              type: e.target.value,
                            });
                          }}
                        >
                          <option value="">Select Type</option>
                          <option value="time">Time</option>
                          <option value="disctance">Distance</option>
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
                        Add Event
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
