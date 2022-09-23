import React, { useState, useEffect } from "react";
import AccessDenied from "../../widgets/AccessDenied";
import PreLoader from "../../widgets/PreLoader";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
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
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import photo from "../../../assets/img/team/profile-picture-3.jpg"
import video from "../../../assets/video/pro duct io n.mp4"
import { toast } from "react-toastify";

export default function AddDisciplineLevel() {
  document.title = "Fitness | Disziplinebene hinzufügen";
  const state = useSelector((state) => state);
  const [loading, setLoading] = useState(false);
  const [displayImage, setDisplayImage] = useState({photo});
  const [displayVideo, setDisplayVideo] = useState({video});
  const [isAdd, setIsAdd] = useState([]);
  const [discActiveId, setDiscActiveId] = useState([]);
  const [allDisc, setAllDisc] = useState([]);
  const [latestDiscLevel, setLatestDiscLevel] = useState(0);
  const history = useHistory();
  const current = format(new Date(), "yyyy-MM-dd_HH:mm:ss");
  const uploadBaseURl =
    "https://ffvsdsgnxuxijtcwboew.supabase.co/storage/v1/object/public/";
  const [loggedUser, setLoggedUser] = useState([])
  const session = supabase.auth.session()
  const loggedUsers = async () => {
    const userData = await supabase.from("admin_users").select().match({email: session['user']['email']})
    setLoggedUser(userData.data[0])
  }
  useEffect(() => {
    loggedUsers();
  }, [])
  const getAllDisc = async () => {
    const { data, error } = await supabase.from("cms_disciplines").select();
    setAllDisc(data);
  };
  useEffect(() => {
    getAllDisc();
  }, []);
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
  const [discDetails, setDiscDetails] = useState({
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      const imageFile = discDetails.image;
      const imageData = await supabase.storage
        .from("discipline")
        .upload("images/" + current + discDetails.image.name, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      const videoFile = discDetails.video;
      const videoData = await supabase.storage
        .from("discipline")
        .upload("videos/" + current + discDetails.video.name, videoFile, {
          cacheControl: "3600",
          upsert: false,
        });
      const ImageURL = uploadBaseURl + imageData.data.Key;
      const VideoURL = uploadBaseURl + videoData.data.Key;
      
      if (imageData.data && videoData.data) {
        const { data, error } = await supabase
          .from("cms_disciplines_leveldetails")
          .insert([
            {
              discipline_id: discActiveId,
              level: latestDiscLevel,
              desc_short: discDetails.desc_short,
              desc_long: discDetails.desc_long,
              point: discDetails.point,
              comn_all_field: discDetails.comn_all_field,
              tag_1: discDetails.tag_1,
              tag_2: discDetails.tag_2,
              tag_3: discDetails.tag_3,
              introduction_1: discDetails.introduction_1,
              introduction_2: discDetails.introduction_2,
              introduction_3: discDetails.introduction_3,
              image: ImageURL,
              video: VideoURL,
            },
          ])
          .single();
        if (error) {
          toast.error("Etwas ist schief gelaufen");
          setLoading(false);
        } else {
          if (data) {
            const activeDicsData = await supabase
              .from("cms_disciplines")
              .select()
              .match({ id: discActiveId });
            await supabase
              .from("admin_logs")
              .insert([
                {
                  module: "Discipline",
                  log_type: "Created",
                  log_desc:
                    loggedUser.firstname +
                    " has created level " +
                    latestDiscLevel +
                    " in discipline " +
                    activeDicsData.data[0].discipline_name,
                  admin_id: loggedUser.id,
                },
              ])
              .single();
            history.push("/disciplinelist");
            toast.success("Disziplinstufe erfolgreich hinzugefügt")
          }
        }
      } else {
        setLoading(false);
        toast.error("Dateien werden nicht hochgeladen, bitte versuchen Sie es erneut");
      }
      setLoading(false);
    }
  };
  const handleDiscChange = async (e) => {
    e.preventDefault();
    function sum() {
      var args = Array.prototype.slice.call(arguments);
      return args.reduce(function (pre, curr) {
        if (!isNaN(curr)) {
          return pre + curr;
        } else {
          throw Error("Non-Numeric arguments" + curr);
        }
      }, 0);
    }
    const discId = e.target.value;
    const { data, error } = await supabase
      .from("cms_disciplines_leveldetails")
      .select()
      .match({ discipline_id: discId })
      .order("level", { ascending: false });
    setDiscActiveId(discId);
    if (data.length) {
      const latestLevel = sum(parseInt(data[0].level), 1);
      setLatestDiscLevel(latestLevel);
    } else {
      const latestLevel = 1;
      setLatestDiscLevel(latestLevel);
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

  const imageHandler = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2){
        setDisplayImage({photo: reader.result})
      }
    }
    reader.readAsDataURL(e.target.files[0])
    setDiscDetails({
          ...discDetails,
          image: e.target.files[0],
        });
  }
  const videoHandler = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2){
        setDisplayVideo({video: reader.result})
      }
    }
    reader.readAsDataURL(e.target.files[0])
    setDiscDetails({
          ...discDetails,
          video: e.target.files[0],
        });
  }

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
                <h5 className="mb-4">Disziplinebene hinzufügen</h5>
                <Form
                  onSubmit={(e) => {
                    handleSubmit(e);
                  }}
                >
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group id="name">
                        <Form.Label>Name der Disziplin</Form.Label>
                        <Form.Select
                          // defaultValue={discDetails.name}
                          onChange={handleDiscChange}
                        >
                          <option>Disziplin auswählen</option>
                          {allDisc.map((disc) => (
                            <option value={disc.id}>
                              {disc.discipline_name}
                            </option>
                          ))}
                        </Form.Select>
                        {discActiveId != "" && (
                          <span className="text-danger">
                            {discValidationError.name}
                          </span>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group id="level">
                        <Form.Label>Disziplinebene</Form.Label>
                        <Form.Control
                          type="text"
                          readOnly
                          placeholder="Disziplinebene"
                          value={latestDiscLevel}
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
                    <Col md={6} className="mb-3">
                      <Form.Group id="comn_all_field">
                        <Form.Label>Level-Ziel</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Beispiel: 6, 15, 20, 28"
                          defaultValue={discDetails.comn_all_field}
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
                          placeholder="Durchschnittliche Punkte."
                          defaultValue={discDetails.point}
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
                      <Form.Group id="image">
                        <Card border="light" className="bg-white mb-4">
                          <Card.Body>
                            <h5 className="mb-4">Select level image</h5>
                            <div className="d-xl-flex align-items-center">
                              <div className="user-avatar xl-avatar">
                                <Image style={{ maxWidth: '80px', maxHeight: '80px' }} fluid rounded src={displayImage.photo} />
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
                                      accept="image/x-png,image/gif,image/jpeg"
                                      defaultValue={discDetails.image}
                                      onChange={imageHandler}
                                    />
                                    <div className="d-md-block text-start">
                                      <div className="fw-normal text-dark mb-1">
                                        Bild auswählen
                                      </div>
                                      <div className="text-gray small">
                                        JPG, GIF or PNG.
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
                      <Form.Group id="video">
                        <Card border="light" className="bg-white mb-4">
                          <Card.Body>
                            <h5 className="mb-4">Select level Video</h5>
                            <div className="d-xl-flex align-items-center">
                              <div className="user-avatar xl-avatar">
                                
                                <video autoPlay={true} style={{ maxWidth: '80px', maxHeight: '80px', borderRadius: '8px' }} src={displayVideo.video}></video>
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
                                      defaultValue={discDetails.video}
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
                        {discValidationError.video != "" && (
                          <span className="text-danger">
                            {discValidationError.video}
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
                          name="desc_short"
                          id="short-desc"
                          rows="3"
                          placeholder="kurze Beschreibung"
                          className="form-control"
                          defaultValue={discDetails.desc_short}
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
                          name="desc_long"
                          id="long-desc"
                          rows="3"
                          placeholder="Lange Beschreibung"
                          className="form-control"
                          defaultValue={discDetails.desc_long}
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
                      <Form.Group id="type">
                        <Form.Label>1st Einführung</Form.Label>
                        <textarea
                          name="introduction_1"
                          id="intro-1"
                          rows="5"
                          placeholder="1st Einführung"
                          className="form-control"
                          defaultValue={discDetails.introduction_1}
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
                      <Form.Group id="type">
                        <Form.Label>2nd Einführung</Form.Label>
                        <textarea
                          name="introduction_2"
                          id="intro-2"
                          rows="5"
                          placeholder="2nd Einführung"
                          className="form-control"
                          defaultValue={discDetails.introduction_2}
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
                      <Form.Group id="type">
                        <Form.Label>3rd Einführung</Form.Label>
                        <textarea
                          name="introduction_3"
                          id="intro-3"
                          rows="5"
                          placeholder="3rd Einführung"
                          className="form-control"
                          defaultValue={discDetails.introduction_3}
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
                        Ebene hinzufügen
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