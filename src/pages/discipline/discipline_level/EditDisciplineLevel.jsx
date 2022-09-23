import React, { useState, useEffect } from "react";
import AccessDeniedImage from "../../../assets/img/access-denied-img.jpg";
import {
  Col,
  Row,
  Card,
  Form,
  Button,
  Spinner,
  Image,
} from "@themesberg/react-bootstrap";
import { supabase } from "../../../supabaseClient";
import { useHistory, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import AccessDenied from "../../widgets/AccessDenied";
import PreLoader from "../../widgets/PreLoader";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import { format } from "date-fns";

export default function EditDisciplineLevel() {
  document.title = "Fitness | Disziplinstufe bearbeiten";
  const state = useSelector((state) => state);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState([]);
  const history = useHistory();
  const params = useParams();
  const [discDetails, setDiscDetails] = useState([]);
  const [displayImage, setDisplayImage] = useState({});
  const [displayVideo, setDisplayVideo] = useState({});
  const uploadBaseURl =
    "https://ffvsdsgnxuxijtcwboew.supabase.co/storage/v1/object/public/";
  const current = format(new Date(), "yyyy-MM-dd_HH:mm:ss");
  const [loggedUser, setLoggedUser] = useState([])
  const session = supabase.auth.session()
  const loggedUsers = async () => {
    const userData = await supabase.from("admin_users").select().match({email: session['user']['email']})
    setLoggedUser(userData.data[0])
  }
  useEffect(() => {
    loggedUsers();
  }, [])

  let discDetailsInitialState = {
    comn_all_field: "",
    tag_1: "",
    point: "",
    image: "",
    video: "",
    desc_short: "",
    desc_long: "",
    introduction_1: "",
    introduction_2: "",
    introduction_3: "",
  };

  const getEditData = async () => {
    const { data, error } = await supabase
      .from("cms_disciplines_leveldetails")
      .select()
      .match({ id: params.level_id, discipline_id: params.id });

    const nameData = await supabase
      .from("cms_disciplines")
      .select()
      .match({ id: params.id });
    setDisplayImage(data[0].image);
    setDisplayVideo(data[0].video);
    setDiscDetails({
      discipline_name: nameData.data[0].discipline_name,
      discipline_id: nameData.data[0].id,
      level: data[0].level,
      comn_all_field: data[0].comn_all_field,
      tag_1: data[0].tag_1,
      tag_2: data[0].tag_2,
      tag_3: data[0].tag_3,
      desc_short: data[0].desc_short,
      desc_long: data[0].desc_long,
      point: data[0].point,
      image: data[0].image,
      video: data[0].video,
      introduction_1: data[0].introduction_1,
      introduction_2: data[0].introduction_2,
      introduction_3: data[0].introduction_3,
    });
    setLoading(false);
  };
  useEffect(() => {
    getEditData();
    return () => {
      setDiscDetails({});
    };
  }, []);

  const [discValidationError, setDiscValidationError] = useState({
    comn_all_field: "",
    tag_1: "",
    point: "",
    image: "",
    video: "",
    desc_short: "",
    desc_long: "",
    introduction_1: "",
    introduction_2: "",
    introduction_3: "",
  });
  let validation_errors = {
    name: "",
    comn_all_field: "Das Feld für den Disziplintyp ist erforderlich.",
    tag_1: "Beschriftungsfeld ist erforderlich.",
    point: "Disziplinpunktfeld ist erforderlich.",
    image: "Bildfeld ist erforderlich.",
    video: "Videofeld ist erforderlich.",
    desc_short: "Das Feld Kurzbeschreibung ist erforderlich.",
    desc_long: "Feld für lange Beschreibung ist erforderlich.",
    introduction_1: "Einführung 1 Feld ist erforderlich.",
    introduction_2: "Einführung 2 Feld ist erforderlich",
    introduction_3: "Einführung 3 Feld ist erforderlich",
  };

  const validateForm = () => {
    let isValidate = true;
    let isAllFilled = true;

    let new_er = discDetailsInitialState;
    Object.keys(discValidationError).forEach((key) => {
      if (discDetails[key] == "") {
        isValidate = false;
        isAllFilled = false;
        new_er = {
          ...new_er,
          [key]: validation_errors[key],
        };
      }
    });

    setDiscValidationError(new_er);
    return isValidate;
  };

  const imageHandler = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setDisplayImage(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
    setDiscDetails({
      ...discDetails,
      image: e.target.files[0],
    });
  };
  const videoHandler = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setDisplayVideo(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
    setDiscDetails({
      ...discDetails,
      video: e.target.files[0],
    });
  };
  let imageURL = "";
  let videoURL = "";
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      const matchdata = await supabase
        .from("cms_disciplines_leveldetails")
        .select()
        .match({
          id: params.level_id,
          discipline_id: params.id,
        });

      if (discDetails.image === matchdata.data[0].image) {
        console.log("default");
        imageURL = matchdata.data[0].image;
      } else {
        const imageData = await supabase.storage
          .from("discipline")
          .upload(
            "images/" + current + discDetails.image.name,
            discDetails.image,
            {
              cacheControl: "3600",
              upsert: false,
            }
          );
        imageURL = uploadBaseURl + imageData.data.Key;
        console.log("added");
      }

      if (discDetails.video === matchdata.data[0].video) {
        console.log("default video");
        videoURL = matchdata.data[0].video;
      } else {
        const videoData = await supabase.storage
          .from("discipline")
          .upload(
            "videos/" + current + discDetails.video.name,
            discDetails.video,
            {
              cacheControl: "3600",
              upsert: false,
            }
          );
        videoURL = uploadBaseURl + videoData.data.Key;
        console.log("added video");
      }
      const { data, error } = await supabase
        .from("cms_disciplines_leveldetails")
        .update([
          {
            discipline_id: discDetails.discipline_id,
            level: discDetails.level,
            comn_all_field: discDetails.comn_all_field,
            tag_1: discDetails.tag_1,
            tag_2: discDetails.tag_2,
            tag_3: discDetails.tag_3,
            desc_short: discDetails.desc_short,
            desc_long: discDetails.desc_long,
            point: discDetails.point,
            image: imageURL,
            video: videoURL,
            introduction_1: discDetails.introduction_1,
            introduction_2: discDetails.introduction_2,
            introduction_3: discDetails.introduction_3,
          },
        ])
        .match({ discipline_id: params.id, id: params.level_id });
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
                log_type: "Updated",
                log_desc:
                  loggedUser.firstname +
                  " has updated level " +
                  discDetails.level +
                  " in discipline " +
                  discDetails.discipline_name,
                admin_id: loggedUser.id,
              },
            ])
            .single();
          history.push(`/edit-discipline/${params.id}`);
          toast.success("Disziplinstufe Erfolgreich aktualisiert");
        }
      }

      setLoading(false);
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
            <Card border="light" className="bg-white shadow-sm mb-4 mt-6">
              <Card.Body>
                <h5 className="mb-4">
                  Bearbeiten {discDetails.discipline_name} Eben
                </h5>
                <Form
                  onSubmit={(e) => {
                    handleSubmit(e);
                  }}
                >
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group id="discName">
                        <Form.Label>Name der Disziplin</Form.Label>
                        <Form.Control
                          defaultValue={discDetails.discipline_name}
                          type="text"
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group id="level">
                        <Form.Label>Disziplinebene</Form.Label>
                        <Form.Control
                          type="number"
                          readOnly
                          defaultValue={discDetails.level}
                        />
                        {discValidationError.level != "" && (
                          <span className="text-danger">
                            {discValidationError.level}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={4} className="mb-3">
                      <Form.Group id="tag-1">
                        <Form.Label>Etikett 1</Form.Label>
                        <Form.Control
                          type="text"
                          defaultValue={discDetails.tag_1}
                          onChange={(e) => {
                            setDiscDetails({
                              ...discDetails,
                              tag_1: e.target.value,
                            });
                          }}
                        />
                        {discValidationError.tag_1 != "" && (
                          <span className="text-danger">
                            {discValidationError.tag_1}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={4} className="mb-3">
                      <Form.Group id="tag_2">
                        <Form.Label>Etikett 2</Form.Label>
                        <Form.Control
                          type="text"
                          defaultValue={discDetails.tag_2}
                          onChange={(e) => {
                            setDiscDetails({
                              ...discDetails,
                              tag_2: e.target.value,
                            });
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4} className="mb-3">
                      <Form.Group id="tag_3">
                        <Form.Label>Etikett 3</Form.Label>
                        <Form.Control
                          type="text"
                          defaultValue={discDetails.tag_3}
                          onChange={(e) => {
                            setDiscDetails({
                              ...discDetails,
                              tag_3: e.target.value,
                            });
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group id="type">
                        <Form.Label>Level-Ziel</Form.Label>
                        <Form.Control
                          defaultValue={discDetails.comn_all_field}
                          type="text"
                          placeholder="Beispiel: 6, 15, 20, 28"
                          onChange={(e) => {
                            setDiscDetails({
                              ...discDetails,
                              comn_all_field: e.target.value,
                            });
                          }}
                        />
                        {discValidationError.comn_all_field != "" && (
                          <span className="text-danger">
                            {discValidationError.comn_all_field}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group id="point">
                        <Form.Label>Disziplinpunkt</Form.Label>
                        <Form.Control
                          type="text"
                          defaultValue={discDetails.point}
                          placeholder="Durchschnittliche Punkte."
                          onChange={(e) => {
                            setDiscDetails({
                              ...discDetails,
                              point: e.target.value,
                            });
                          }}
                        />
                        {discValidationError.point != "" && (
                          <span className="text-danger">
                            {discValidationError.point}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group id="image">
                        <Card border="light" className="bg-white mb-4">
                          <Card.Body>
                            <h5 className="mb-4">Select level image</h5>
                            <div className="d-xl-flex align-items-center">
                              <div className="user-avatar xl-avatar">
                                <Image
                                  style={{
                                    maxWidth: "80px",
                                    maxHeight: "80px",
                                  }}
                                  fluid
                                  rounded
                                  src={displayImage}
                                />
                              </div>
                              <div className="file-field">
                                <div className="d-flex justify-content-xl-center ms-xl-3">
                                  <div className="d-flex">
                                    <span className="icon icon-md">
                                      <FontAwesomeIcon
                                        icon={faPaperclip}
                                        className="me-3"
                                      />
                                    </span>
                                    <Form.Control
                                      type="file"
                                      // defaultValue={discDetails.image}
                                      accept="image/x-png,image/gif,image/jpeg"
                                      onChange={imageHandler}
                                    />
                                    <div className="d-md-block text-start">
                                      <div className="fw-normal text-dark mb-1">
                                        Bild auswählen
                                      </div>
                                      <div className="text-gray small">
                                        JPG, GIF or PNG. Max size of 800K
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                        {discValidationError.image != "" && (
                          <span className="text-danger">
                            {discValidationError.image}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group id="image">
                        <Card border="light" className="bg-white mb-4">
                          <Card.Body>
                            <h5 className="mb-4">Select level Video</h5>
                            <div className="d-xl-flex align-items-center">
                              <div className="user-avatar xl-avatar">
                                <video
                                  style={{
                                    maxWidth: "80px",
                                    maxHeight: "80px",
                                    borderRadius: "8px",
                                  }}
                                  autoPlay={true}
                                  src={displayVideo}
                                ></video>
                              </div>
                              <div className="file-field">
                                <div className="d-flex justify-content-xl-center ms-xl-3">
                                  <div className="d-flex">
                                    <span className="icon icon-md">
                                      <FontAwesomeIcon
                                        icon={faPaperclip}
                                        className="me-3"
                                      />
                                    </span>
                                    <Form.Control
                                      type="file"
                                      // defaultValue={discDetails.video}
                                      accept="video/mp4,video/x-m4v,video/*"
                                      onChange={videoHandler}
                                    />
                                    <div className="d-md-block text-start">
                                      <div className="fw-normal text-dark mb-1">
                                        Video auswählen
                                      </div>
                                      <div className="text-gray small">
                                        MP4, MKV etc.
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                        {discValidationError.image != "" && (
                          <span className="text-danger">
                            {discValidationError.image}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group id="type">
                        <Form.Label>kurze Beschreibung</Form.Label>
                        <textarea
                          defaultValue={discDetails.desc_short}
                          name="desc_short"
                          id="short-desc"
                          rows="3"
                          placeholder="kurze Beschreibung"
                          className="form-control"
                          onChange={(e) => {
                            setDiscDetails({
                              ...discDetails,
                              desc_short: e.target.value,
                            });
                          }}
                        ></textarea>
                        {discValidationError.desc_short != "" && (
                          <span className="text-danger">
                            {discValidationError.desc_short}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group id="type">
                        <Form.Label>Lange Beschreibung</Form.Label>
                        <textarea
                          defaultValue={discDetails.desc_long}
                          name="desc_long"
                          id="long-desc"
                          rows="3"
                          placeholder="Lange Beschreibung"
                          className="form-control"
                          onChange={(e) => {
                            setDiscDetails({
                              ...discDetails,
                              desc_long: e.target.value,
                            });
                          }}
                        ></textarea>
                        {discValidationError.desc_long != "" && (
                          <span className="text-danger">
                            {discValidationError.desc_long}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group id="introduction_1">
                        <Form.Label>1st Einführung</Form.Label>
                        <textarea
                          defaultValue={discDetails.introduction_1}
                          name="introduction_1"
                          id="intro-1"
                          rows="5"
                          placeholder="1st Einführung"
                          className="form-control"
                          onChange={(e) => {
                            setDiscDetails({
                              ...discDetails,
                              introduction_1: e.target.value,
                            });
                          }}
                        ></textarea>
                        {discValidationError.introduction_1 != "" && (
                          <span className="text-danger">
                            {discValidationError.introduction_1}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group id="introduction_2">
                        <Form.Label>2nd Einführung</Form.Label>
                        <textarea
                          defaultValue={discDetails.introduction_2}
                          name="introduction_2"
                          id="intro-2"
                          rows="5"
                          placeholder="2nd Einführung"
                          className="form-control"
                          onChange={(e) => {
                            setDiscDetails({
                              ...discDetails,
                              introduction_2: e.target.value,
                            });
                          }}
                        ></textarea>
                        {discValidationError.introduction_2 != "" && (
                          <span className="text-danger">
                            {discValidationError.introduction_2}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group id="introduction_3">
                        <Form.Label>3rd Einführung</Form.Label>
                        <textarea
                          defaultValue={discDetails.introduction_3}
                          name="introduction_3"
                          id="intro-3"
                          rows="5"
                          placeholder="3rd Einführung"
                          className="form-control"
                          onChange={(e) => {
                            setDiscDetails({
                              ...discDetails,
                              introduction_3: e.target.value,
                            });
                          }}
                        ></textarea>
                        {discValidationError.introduction_3 != "" && (
                          <span className="text-danger">
                            {discValidationError.introduction_3}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="mt-3">
                    {!loading ? (
                      <Button variant="primary" type="submit" className="w-100">
                        Stufe aktualisieren
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