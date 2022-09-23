import React, { useState } from "react";
import SimpleBar from "simplebar-react";
import { useLocation, Link } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Logo from "../assets/img/icons/temp-logo.jpg";
import {
  faChartPie,
  faSignOutAlt,
  faTimes,
  faUser,
  faUserFriends,
  faRunning,
  faUniversalAccess,
  faTachometerAlt,
  faAddressBook,
  faUserSecret,
  faBullseye,
} from "@fortawesome/free-solid-svg-icons";
import {
  Nav,
  Badge,
  Image,
  Button,
  Dropdown,
  Accordion,
  Navbar,
} from "@themesberg/react-bootstrap";

import { Routes } from "../routes";
import ThemesbergLogo from "../assets/img/themesberg.svg";
import ReactHero from "../assets/img/technologies/react-hero-logo.svg";
import ProfilePicture from "../assets/img/team/profile-picture-3.jpg";
import { useSelector } from "react-redux/es/exports";
import { supabase } from "../supabaseClient";
import { useEffect } from "react";

export default (props = {}) => {
  const state = useSelector((state) => state);
  const [rightsData, setRightsData] = useState([]);
  const location = useLocation();
  const { pathname } = location;
  const [show, setShow] = useState(false);
  const [roleId, setRoleId] = useState([]);
  const showClass = show ? "show" : "";
  const getRights = async () => {
    const session = supabase.auth.session()
    const loggedUser = await supabase.from('admin_users').select().match({ email: session['user']['email'] })
    setRoleId(loggedUser.data[0].role_id)
    const { data, error } = await supabase
      .from("admin_rights")
      .select()
      .match({ role_id: loggedUser.data[0].role_id });
    setRightsData(data);
  };
  useEffect(() => {
    getRights();
  }, []);

  const handleLogout = async (e) => {
    const { error } = await supabase.auth.signOut();
    window.location.href = "/";
    // localStorage.clear();
    // window.location.href = "/";
  };

  const onCollapse = () => setShow(!show);

  const CollapsableNavItem = (props) => {
    const { eventKey, title, icon, children = null } = props;
    const defaultKey = pathname.indexOf(eventKey) !== -1 ? eventKey : "";

    return (
      <Accordion as={Nav.Item} defaultActiveKey={defaultKey}>
        <Accordion.Item eventKey={eventKey}>
          <Accordion.Button
            as={Nav.Link}
            className="d-flex justify-content-between align-items-center"
          >
            <span>
              <span className="sidebar-icon">
                <FontAwesomeIcon icon={icon} />{" "}
              </span>
              <span className="sidebar-text">{title}</span>
            </span>
          </Accordion.Button>
          <Accordion.Body className="multi-level">
            <Nav className="flex-column">{children}</Nav>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  };

  const NavItem = (props) => {
    const {
      title,
      link,
      external,
      target,
      icon,
      image,
      badgeText,
      badgeBg = "secondary",
      badgeColor = "primary",
    } = props;
    const classNames = badgeText
      ? "d-flex justify-content-start align-items-center justify-content-between"
      : "";
    const navItemClassName = link === pathname ? "active" : "";
    const linkProps = external ? { href: link } : { as: Link, to: link };

    return (
      <Nav.Item className={navItemClassName} onClick={() => setShow(false)}>
        <Nav.Link {...linkProps} target={target} className={classNames}>
          <span>
            {icon ? (
              <span className="sidebar-icon">
                <FontAwesomeIcon icon={icon} />{" "}
              </span>
            ) : null}
            {image ? (
              <Image
                src={image}
                width={20}
                height={20}
                className="sidebar-icon svg-icon"
              />
            ) : null}

            <span className="sidebar-text">{title}</span>
          </span>
          {badgeText ? (
            <Badge
              pill
              bg={badgeBg}
              text={badgeColor}
              className="badge-md notification-count ms-2"
            >
              {badgeText}
            </Badge>
          ) : null}
        </Nav.Link>
      </Nav.Item>
    );
  };

  return (
    <>
      <Navbar
        expand={false}
        collapseOnSelect
        variant="dark"
        className="navbar-theme-primary px-4 d-md-none"
      >
        <Navbar.Brand
          className="me-lg-5"
          as={Link}
          to={Routes.DashboardOverview.path}
        >
          <Image src={ReactHero} className="navbar-brand-light" />
        </Navbar.Brand>
        <Navbar.Toggle
          as={Button}
          aria-controls="main-navbar"
          onClick={onCollapse}
        >
          <span className="navbar-toggler-icon" />
        </Navbar.Toggle>
      </Navbar>
      <CSSTransition timeout={300} in={show} classNames="sidebar-transition">
        <SimpleBar
          className={`collapse ${showClass} sidebar d-md-block bg-primary text-white`}
        >
          <div className="sidebar-inner px-4 pt-3">
            <div className="user-card d-flex d-md-none align-items-center justify-content-between justify-content-md-center pb-4">
              <div className="d-flex align-items-center">
                <div className="user-avatar lg-avatar me-4">
                  <Image
                    src={ProfilePicture}
                    className="card-img-top rounded-circle border-white"
                  />
                </div>
                <div className="d-block">
                  <h6>Hi, Jane</h6>
                  <Button
                    as={Link}
                    variant="secondary"
                    size="xs"
                    to={Routes.Signin.path}
                    className="text-dark"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />{" "}
                    Sign Out
                  </Button>
                </div>
              </div>
              <Nav.Link
                className="collapse-close d-md-none"
                onClick={onCollapse}
              >
                <FontAwesomeIcon icon={faTimes} />
              </Nav.Link>
            </div>
            <div
              style={{ borderBottom: "1px solid rgb(255 255 255 / 18%)" }}
              className="d-flex align-items-center pb-3"
            >
              <div>
                <Link to={"/"}>
                  <img
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                    }}
                    src={Logo}
                    alt="side-logo"
                  />
                </Link>
              </div>
              <div style={{ paddingLeft: "15px" }}>
                <Link to={"/"}>
                  <h5 className="m-0">Fitness-App</h5>
                </Link>
              </div>
            </div>
            <Nav className="flex-column pt-3 pt-3">
              <NavItem
                title="Armaturenbrett"
                link={"/"}
                icon={faTachometerAlt}
              />
              {rightsData.map(
                (right) =>
                  right.list_rights === 1 &&
                  right.page_id === 1 && (
                    <NavItem
                      title="Benutzer verwalten"
                      link={"/userlist"}
                      icon={faUserFriends}
                    />
                  )
              )}

              {rightsData.map(
                (right) =>
                  right.list_rights === 1 &&
                  right.page_id === 2 && (
                    <NavItem
                      title="Trainer verwalten"
                      link={"/trainerlist"}
                      icon={faUser}
                    />
                  )
              )}
              {rightsData.map(
                (right) =>
                  right.list_rights === 1 &&
                  right.page_id === 3 && (
                    <NavItem
                      title="Disziplin verwalten"
                      link={"/disciplinelist"}
                      icon={faRunning}
                    />
                  )
              )}
              {rightsData.map(
                (right) =>
                  right.list_rights === 1 &&
                  right.page_id === 5 && (
                    <NavItem
                      title="Rolle verwalten"
                      link={"/rolelist"}
                      icon={faUserSecret}
                    />
                  )
              )}
              {roleId === 1 && (
                <NavItem
                  title="Zugangsrechte"
                  link={"/access-rights"}
                  icon={faUniversalAccess}
                />
              )}
              {roleId === 1 && (
                <NavItem
                  title="Benutzer protokolle"
                  link={"/userlogs"}
                  icon={faAddressBook}
                />
              )}
              {roleId === 1 && (
                <NavItem
                  title="Veranstaltung verwalten"
                  link={"/events"}
                  icon={faBullseye}
                />
              )}
              <div
                className="p-2 d-flex align-items-center logout-sidebar"
                onClick={handleLogout}
              >
                <div style={{ paddingLeft: "5px", paddingRight: "15px" }}>
                  <FontAwesomeIcon icon={faSignOutAlt} />
                </div>
                <div>Ausloggen</div>
              </div>
            </Nav>
          </div>
        </SimpleBar>
      </CSSTransition>
    </>
  );
};
