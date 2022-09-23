import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faUnlockAlt } from "@fortawesome/free-solid-svg-icons";
import {
  Col,
  Spinner,
  Row,
  Form,
  Button,
  Container,
  InputGroup,
} from "@themesberg/react-bootstrap";
import { useHistory } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useDispatch } from "react-redux";

export default function Login() {
  document.title = "Fitness | Einloggen";
  let email_pattern =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  let loginDetailsInitialState = {
    email: "",
    password: "",
  };

  const [loginDetails, setLoginDetails] = useState({
    email: "",
    password: "",
  });

  const [loginValidationError, setLoginValidationError] = useState({
    email: "",
    password: "",
  });

  let validation_errors = {
    email: "E-Mail-Feld ist erforderlich.",
    password: "Passwortfeld ist erforderlich.",
    email_not_validate: "Diese E-Mail ist ungültig.",
  };

  const validateForm = () => {
    let isValidate = true;
    let isAllFilled = true;

    let new_er = loginDetailsInitialState;
    Object.keys(loginValidationError).forEach((key) => {
      if (loginDetails[key] === "") {
        isValidate = false;
        isAllFilled = false;
        new_er = {
          ...new_er,
          [key]: validation_errors[key],
        };
      }
    });
    if (isAllFilled) {
      if (loginDetails.email !== "") {
        if (!loginDetails.email.match(email_pattern)) {
          isValidate = false;
          new_er = {
            ...new_er,
            email: validation_errors.email_not_validate,
          };
        }
      }
    }
    setLoginValidationError(new_er);
    return isValidate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const { user, error } = await supabase.auth.signIn({
        email: loginDetails.email,
        password: loginDetails.password,
      });
      if (error) {
        toast.error('Ungültige Anmeldeinformationen.')
      }else if(user){
        window.location.href = "/";
        const session = supabase.auth.session()
      }
    }
  };

  return (
    <main>
      <section className="d-flex align-items-center my-5 mt-lg-6 mb-lg-5">
        <Container>
          <ToastContainer />
          {/* <p className="text-center">
            <Card.Link as={Link} to={Routes.DashboardOverview.path} className="text-gray-700">
              <FontAwesomeIcon icon={faAngleLeft} className="me-2" /> Back to homepage
            </Card.Link>
          </p> */}
          {/* <Row className="justify-content-center form-bg-image" style={{ backgroundImage: `url(${BgImage})` }}> */}
          <Row className="justify-content-center form-bg-image">
            <Col
              xs={12}
              className="d-flex align-items-center justify-content-center"
            >
              <div className="bg-white shadow-soft border rounded border-light p-4 p-lg-5 w-100 fmxw-500">
                <div className="text-center text-md-center mb-4 mt-md-0">
                  <h3 className="mb-0">Einloggen</h3>
                </div>
                <Form
                  onSubmit={(e) => {
                    handleSubmit(e);
                  }}
                  className="mt-4"
                >
                  <Form.Group id="email" className="mb-4">
                    <Form.Label>Deine E-Mail</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faEnvelope} />
                      </InputGroup.Text>
                      <Form.Control
                        autoFocus
                        value={loginDetails.email}
                        onChange={(e) => {
                          setLoginDetails({
                            ...loginDetails,
                            email: e.target.value,
                          });
                        }}
                        type="text"
                        placeholder="E-Mail"
                      />
                    </InputGroup>
                    {loginValidationError.email !== "" && (
                      <span className="text-danger">
                        {loginValidationError.email}
                      </span>
                    )}
                  </Form.Group>
                  <Form.Group>
                    <Form.Group id="password" className="mb-4">
                      <Form.Label>Deine Passwort</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FontAwesomeIcon icon={faUnlockAlt} />
                        </InputGroup.Text>
                        <Form.Control
                          onChange={(e) => {
                            setLoginDetails({
                              ...loginDetails,
                              password: e.target.value,
                            });
                          }}
                          type="password"
                          value={loginDetails.password}
                          placeholder="Passwort"
                        />
                      </InputGroup>
                      {loginValidationError.password !== "" && (
                        <span className="text-danger">
                          {loginValidationError.password}
                        </span>
                      )}
                    </Form.Group>
                    {/* <div className="d-flex justify-content-between align-items-center mb-4">
                      <Form.Check type="checkbox">
                        <FormCheck.Input id="defaultCheck5" className="me-2" />
                        <FormCheck.Label htmlFor="defaultCheck5" className="mb-0">Remember me</FormCheck.Label>
                      </Form.Check>
                    
                    </div> */}
                  </Form.Group>

                  {!loading ? (
                    <Button variant="primary" type="submit" className="w-100">
                      Einloggen
                    </Button>
                  ) : (
                    <Button variant="primary" type="submit" className="w-100">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </Button>
                  )}
                </Form>

                {/* <div className="mt-3 mb-4 text-center">
                  <span className="fw-normal">or login with</span>
                </div> */}
                {/* <div className="d-flex justify-content-center my-4">
                  <Button variant="outline-light" className="btn-icon-only btn-pill text-facebook me-2">
                    <FontAwesomeIcon icon={faFacebookF} />
                  </Button>
                  <Button variant="outline-light" className="btn-icon-only btn-pill text-twitter me-2">
                    <FontAwesomeIcon icon={faTwitter} />
                  </Button>
                  <Button variant="outline-light" className="btn-icon-only btn-pil text-dark">
                    <FontAwesomeIcon icon={faGithub} />
                  </Button>
                </div> */}
                {/* <div className="d-flex justify-content-center align-items-center mt-4">
                  <span className="fw-normal">
                    Not registered?
                    <Card.Link as={Link} to={Routes.Signup.path} className="fw-bold">
                      {` Create account `}
                    </Card.Link>
                  </span>
                </div> */}
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
}

// @"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "[System.Net.ServicePointManager]::SecurityProtocol = 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"

// Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
// choco install mkcert
// mkcert -install
// mkcert localhost
