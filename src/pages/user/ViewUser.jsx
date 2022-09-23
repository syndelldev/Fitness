import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import defaultProfile from "../../assets/img/default-profile.png";
import { useSelector } from "react-redux";
import AccessDenied from "../widgets/AccessDenied";
import PreLoader from "../widgets/PreLoader";

export default function ViewUser() {
  document.title = "Fitness | Benutzer anzeigen";
  const state = useSelector((state) => state);
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const [isView, setIsView] = useState(true);
  const [loggedUser, setLoggedUser] = useState([])
  const session = supabase.auth.session()
  const loggedUsers = async () => {
    const userData = await supabase.from("admin_users").select().match({email: session['user']['email']})
    setLoggedUser(userData.data[0])
  }
  useEffect(() => {
    loggedUsers();
  }, [])
  const getUser = async () => {
    const { data, error } = await supabase
      .from("users")
      .select()
      .match({ id: params.id });
    setUser(data[0]);
    setLoading(false);
  };
  const getViewRights = async () => {
    setLoading(true);
    const userData = await supabase.from("admin_users").select().match({email: session['user']['email']})
    const adminRole = await supabase
      .from("admin_users")
      .select()
      .match({ id: userData.data[0].id });
    const { data } = await supabase.from("admin_rights").select().match({
      role_id: adminRole.data[0].role_id,
      page_id: 1,
    });

    if (data[0].view_rights !== 1) {
      setIsView(false);
      setLoading(false);
    } else {
      getUser();
    }
  };
  useEffect(() => {
    getUser();
    getViewRights();
  }, []);

  if (!loading) {
    return (
      <>
        {isView ? (
          <div className="main-user-details">
            <div>
              <div className="d-flex justify-content-between mt-5 mb-3">
                {/*view user*/}
                <h2>Benutzerdetail</h2>
              </div>
              <div className="mt-4 inner-main">
                <div className="profile-section w-50">
                  <div className="row d-flex align-items-center my-5">
                    <div style={{ width: 'auto' }}>
                      <img
                        src={
                          user.profilimage ? user.profilimage : defaultProfile
                        }
                        alt="profile"
                        width={100}
                      />
                    </div>

                    <h3 style={{ width: 'auto' }}>
                      {user.firstname} {user.lastname}
                    </h3>
                  </div>
                  <div className="row d-flex">
                    <h3 className="col-5">Benutzername : </h3>
                    <h3 className="col-7">{user.lastname}</h3>
                  </div>
                  <hr />
                  <div className="row d-flex">
                    <h3 className="col-5">E-mail : </h3>
                    <h3 className="col-7">{user.email}</h3>
                  </div>
                  <hr />
                  <div className="row d-flex">
                    <h3 className="col-5">Selbst Punkte : </h3>
                    <h3 className="col-7">{user.self_points}</h3>
                  </div>
                  <hr />
                  <div className="row d-flex">
                    <h3 className="col-5">Offizielle Punkte : </h3>
                    <h3
                      className="col-7"
                      style={{ color: "#e8ba00", fontWeight: "bold" }}
                    >
                      {user.coach_points}
                    </h3>
                  </div>
                  <hr />
                  <div className="row d-flex">
                    <h3 className="col-5">Geschlecht : </h3>
                    <h3 className="col-7">{user.gender}</h3>
                  </div>
                  <hr />
                  <div className="row d-flex">
                    <h3 className="col-5">Telefon : </h3>
                    <h3 className="col-7">{user.phone}</h3>
                  </div>
                  <hr />
                  <div className="row d-flex">
                    <h3 className="col-5">Status : </h3>

                    <h3 className="col-7">
                      {user.status === 1 ? "Active" : "Deactivate"}
                    </h3>
                  </div>
                  <hr />
                  <div className="row d-flex">
                    <h3 className="col-5">Einladungscode : </h3>
                    <h3 className="col-7">{user.invcode}</h3>
                  </div>
                  <hr />
                  <div className="row d-flex">
                    <h3 className="col-5">Einmal einloggen : </h3>
                    <h3 className="col-7">{user.once_registered === 1 ? "Yes" : "No"}</h3>
                  </div>
                </div>
              </div>
            </div>
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
