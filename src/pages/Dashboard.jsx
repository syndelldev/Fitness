import React from "react";
import { useHistory, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Col,
  Row,
  Card,
  Image,
  Button,
  ListGroup,
  ProgressBar,
  Table,
} from "@themesberg/react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCog,
  faCheckCircle,
  faShieldAlt,
  faShieldVirus,
  faCheck,
  faBadgeCheck,
  faPlus,
  faRocket,
  faTasks,
  faUserShield0,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";

export default function Dashboard() {
  document.title = "Fitness | Armaturenbrett";
  const [totalCountUsers, setTotalCountUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState([]);
  const [notRegisteredUsers, setNotregisteredUsers] = useState([]);
  const [totalResults, setTotalResults] = useState([]);
  const history = useHistory();
  const getDashboardDetails = async () => {
    const usersLength = await supabase.from("users").select();
    setTotalCountUsers(usersLength.data.length);
    const totalUserss = await supabase
      .from("users")
      .select()
      .order("coach_points", { ascending: false });
    setTotalUsers(totalUserss.data);
    const unUsedCodes = await supabase
      .from("users")
      .select()
      .match({ once_registered: 0 });
    setNotregisteredUsers(unUsedCodes.data.length);

    const completedDisc = await supabase
      .from("disciplines_completed")
      .select()
      .match({ status: 1 });
    setTotalResults(completedDisc.data.length);
  };
  useEffect(() => {
    getDashboardDetails();
  }, []);

  return (
    <div>
      <Row className="justify-content-between align-items-center mt-5 pt-2">
        <Col xs={12} sm={12} xl={4} className="mb-6">
          <Card border="light" className="shadow-sm">
            <Card.Body style={{ marginLeft: 12 }}>
              <Row className="d-block d-xl-flex align-items-center">
                <Col xs={8} xl={8} className="px-xl-0">
                  <div className="ml-2">
                    {/* TOTAL USERS */}
                    <div className="d-sm-block pt-1">
                      <h4>Gesamte Benutzer</h4>
                    </div>

                    <div>
                      <h5>{totalCountUsers}</h5>
                    </div>
                  </div>
                </Col>
                <Col
                  xl={4}
                  className="text-xl-center d-flex align-items-center justify-content-xl-center mb-3 mb-xl-0"
                >
                  <div
                    className={`icon icon-shape icon-md rounded me-4 me-sm-0`}
                  >
                    <FontAwesomeIcon icon={faUserCircle} />
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={12} xl={4} className="mb-6">
          <Card border="light" className="shadow-sm">
            <Card.Body style={{ marginLeft: 12 }}>
              <Row className="d-block d-xl-flex align-items-center">
                <Col xl={8} xs={8} className="px-xl-0">
                  <div className="ml-2">
                    {/* UNUSED CODES */}
                    <div className="d-sm-block pt-1">
                      <h4>Unbenutzte Codes</h4>
                    </div>
                    <div>
                      <h5>{notRegisteredUsers}</h5>
                    </div>
                  </div>
                </Col>
                <Col
                  xl={4}
                  xs={4}
                  className="text-xl-center d-flex align-items-center justify-content-xl-center mb-3 mb-xl-0"
                >
                  <div
                    className={`icon icon-shape icon-md rounded me-4 me-sm-0`}
                  >
                    <FontAwesomeIcon icon={faShieldAlt} />
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={12} xl={4} className="mb-6">
          <Card border="light" className="shadow-sm">
            <Card.Body style={{ marginLeft: 12 }}>
              <Row className="d-block d-xl-flex align-items-center">
                <Col xl={8} xs={8} className="px-xl-0">
                  <div className="ml-2">
                    {/* ALL RESULTS */}
                    <div className="d-sm-block pt-1">
                      <h4>Ergebnisse</h4>
                    </div>
                    <div>
                      <h5>{totalResults}</h5>
                    </div>
                  </div>
                </Col>
                <Col
                  xl={4}
                  xs={4}
                  className="text-xl-center d-flex align-items-center justify-content-xl-center mb-3 mb-xl-0"
                >
                  <div
                    className={`icon icon-shape icon-md rounded me-4 me-sm-0`}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col xs={12} sm={12} lg={12} xl={12}>
          <table className="table leaderboard-table">
            <thead className="thead-dark">
              <tr>
                <th scope="col">#</th>
                <th scope="col">VOLLSTÄNDIGER NAME</th>
                <th scope="col">Selbst Punkt</th>
                <th scope="col">Offizielle Punkte</th>
                <th scope="col">Über Benutzer</th>
              </tr>
            </thead>
            <tbody>
              {totalUsers.map((user, index) =>
                index < 10 ? (
                  <tr>
                    <td scope="row">{index + 1}</td>
                    <td>
                      {user.firstname} {user.lastname}
                    </td>
                    <td>{user.self_points}</td>
                    <td className="leader-off-point">{user.coach_points}</td>
                    <td className="leader-btn">
                      <button
                        onClick={() => {
                          history.push(`view-user/${user.id}`);
                        }}
                      >
                        Einzelheiten
                      </button>
                    </td>
                  </tr>
                ) : (
                  ""
                )
              )}
            </tbody>
          </table>
        </Col>
      </Row>
    </div>
  );
}
