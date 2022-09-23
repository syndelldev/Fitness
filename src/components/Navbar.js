import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { faUserCircle } from "@fortawesome/free-regular-svg-icons";
import {
  Row,
  Col,
  Nav,
  Image,
  Navbar,
  Dropdown,
  Container,
  ListGroup,
} from "@themesberg/react-bootstrap";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import Profile3 from "../assets/img/default-profile.png";
import { supabase } from "../supabaseClient";

export default (props) => {
  const [notifications, setNotifications] = useState([]);
  const areNotificationsRead = notifications.reduce(
    (acc, notif) => acc && notif.read,
    true
  );
  const state = useSelector((state) => state);
  const [userData, setUserData] = useState([]);
  const history = useHistory();
  const getData = async () => {
    const session = supabase.auth.session();
    const loggedUser = await supabase
      .from("admin_users")
      .select()
      .match({ email: session["user"]["email"] });
    setUserData(loggedUser.data[0]);
  };
  useEffect(() => {
    getData();
  }, []);

  const handleLogout = async (e) => {
    const { error } = await supabase.auth.signOut();
    window.location.href = "/";
  };
  // const markNotificationsAsRead = () => {
  //   setTimeout(() => {
  //     setNotifications(notifications.map((n) => ({ ...n, read: true })));
  //   }, 300);
  // };
  const Notification = (props) => {
    const { link, sender, image, time, message, read = false } = props;
    const readClassName = read ? "" : "text-danger";

    return (
      <ListGroup.Item action href={link} className="border-bottom border-light">
        <Row className="align-items-center">
          <Col className="col-auto">
            <Image
              src={image}
              className="user-avatar lg-avatar rounded-circle"
            />
          </Col>
          <Col className="ps-0 ms--2">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="h6 mb-0 text-small">{sender}</h4>
              </div>
              <div className="text-end">
                <small className={readClassName}>{time}</small>
              </div>
            </div>
            <p className="font-small mt-1 mb-0">{message}</p>
          </Col>
        </Row>
      </ListGroup.Item>
    );
  };

  return (
    <Navbar variant="dark" expanded className="ps-0 pe-2 pb-0">
      <Container fluid className="px-0">
        <div className="d-flex justify-content-between w-100">
          <Nav>
            <button
              className="btn"
              style={{ backgroundColor: "#2f93e973", color: "#000000" }}
              onClick={(e) => history.goBack()}
            >
              Geh Zurück
            </button>
          </Nav>
          <Nav className="align-items-center">
            <Dropdown as={Nav.Item}>
              <Dropdown.Toggle as={Nav.Link} className="pt-1 px-0">
                <div className="media d-flex align-items-center">
                  <Image
                    src={Profile3}
                    className="user-avatar md-avatar rounded-circle"
                  />
                  <div className="media-body ms-2 text-dark align-items-center d-none d-lg-block">
                    <span className="mb-0 font-small fw-bold">
                      {userData.firstname}
                    </span>
                  </div>
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu className="user-dropdown dropdown-menu-right mt-2">
                {/* <Dropdown.Item className="fw-bold">
                  <FontAwesomeIcon icon={faUserCircle} className="me-2" /> Mein Profil
                </Dropdown.Item> */}
                <Dropdown.Divider />
                <Dropdown.Item className="fw-bold" onClick={handleLogout}>
                  <FontAwesomeIcon
                    icon={faSignOutAlt}
                    className="text-danger me-2"
                  />{" "}
                  Ausloggen
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </div>
      </Container>
    </Navbar>
  );
};
