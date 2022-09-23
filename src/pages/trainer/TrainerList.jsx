import { useHistory, Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import DataTable from "react-data-table-component";
import { Card } from "@themesberg/react-bootstrap";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import EditIcon from "@material-ui/icons/Edit";
import AccessDenied from "../widgets/AccessDenied";
import PreLoader from "../widgets/PreLoader";
import { toast } from "react-toastify";

export default function TrainerList() {
  document.title = "Fitness | Trainerliste";
  const state = useSelector((state) => state);
  const [trainers, setTrainers] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredTrainers, setFitleredTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isList, setIsList] = useState(true);
  const [isDeactivate, setIsDeactivate] = useState(true);
  const [loggedUser, setLoggedUser] = useState([])
  const session = supabase.auth.session()
  const loggedUsers = async () => {
    const userData = await supabase.from("admin_users").select().match({email: session['user']['email']})
    setLoggedUser(userData.data[0])
  }
  useEffect(() => {
    loggedUsers();
  }, [])

  const history = useHistory();

  const getTrainers = async () => {
    const { data, error } = await supabase
      .from("admin_users")
      .select()
      .eq("role_id", 2)
      .order("id", { ascending: false });
    setTrainers(data);
    setFitleredTrainers(data);
    setLoading(false);
  };
  const getListRights = async () => {
    setLoading(true);
    const userData = await supabase.from("admin_users").select().match({email: session['user']['email']})
    const adminRole = await supabase
      .from("admin_users")
      .select()
      .match({ id: userData.data[0].id });
    const rightsdata = await supabase.from("admin_rights").select().match({
      role_id: adminRole.data[0].role_id,
      page_id: 2
    })
    if (rightsdata.data[0].deactivate_rights !== 1) {
      setIsDeactivate(false);
    }
    if (rightsdata.data[0].list_rights !== 1) {
      setIsList(false);
      setLoading(false);
    } else {
      getTrainers();
    }
  };
  const handleChange = async (e, row_id) => {
    if (!isDeactivate) {
      toast.error("Sie haben keinen Zugriff");
    } else {
      let value = e.target.value;
      const { data, error } = await supabase
        .from("admin_users")
        .update([
          {
            status: parseInt(value) === 1 ? 0 : 1,
          },
        ])
        .match({ id: row_id });
      if (error) {
        toast.error("Etwas ist schief gelaufen");
      } else {
        if (data) {
          let logDesc = "";
          const activeUserData = await supabase
            .from("admin_users")
            .select()
            .match({ id: row_id });
          const activeUserRole = await supabase
            .from("admin_roles")
            .select()
            .match({ id: activeUserData.data[0].role_id });
          if (data[0].status === 1) {
            toast.success("Trainer aktiviert");
            logDesc =
              loggedUser.firstname +
              " has activated " +
              activeUserRole.data[0].name +
              " " +
              activeUserData.data[0].firstname;
          } else {
            toast.error("Trainer deaktiviert");
            logDesc =
              loggedUser.firstname +
              " has deactivated " +
              activeUserRole.data[0].name +
              " " +
              activeUserData.data[0].firstname;
          }
          await supabase
            .from("admin_logs")
            .insert([
              {
                module: "Trainer",
                log_type: "Change Status",
                log_desc: logDesc,
                admin_id: loggedUser.id,
              },
            ])
            .single();
          let newJsonToAppend = [];
          filteredTrainers.forEach((user) => {
            if (user.id == row_id) {
              let userToAppend = {
                ...user,
                status: parseInt(value) === 1 ? 0 : 1,
              };
              newJsonToAppend = [...newJsonToAppend, userToAppend];
            } else {
              newJsonToAppend = [...newJsonToAppend, user];
            }
          });
          setFitleredTrainers(newJsonToAppend);
        }
      }
    }
  };
  const columns = [
    {
      name: "#",
      cell: (row, index) => index + 1,
    },
    {
      name: "Vorname",
      selector: (row) => row.firstname,
      sortable: true,
    },
    {
      name: "Nachname",
      selector: (row) => row.lastname,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <label className="switch">
          <input
            type="checkbox"
            checked={row.status == 1 ? true : false}
            value={row.status}
            onChange={(e) => handleChange(e, row.id)}
          />
          <span className="slider round"></span>
        </label>
      ),
    },
    {
      name: "Erstellungsdatum",
      selector: (row) => format(new Date(row.created_at), "yyyy-MM-dd"),
      sortable: true,
    },
    {
      name: "Aktion",
      cell: (row) => (
        <div className="d-flex action-btn-main">
          <div className="mx-1">
            <EditIcon
              onClick={() => {
                history.push(`edit-trainer/${row.id}`);
              }}
            />
          </div>
        </div>
      ),
    },
  ];
  useEffect(() => {
    getTrainers();
    getListRights();
  }, []);

  useEffect(() => {
    const result = trainers.filter((trainer) => {
      return trainer.lastname.toLowerCase().match(search.toLowerCase());
    });
    setFitleredTrainers(result);
  }, [search]);

  if (!loading) {
    return (
      <>
        {isList ? (
          <div>
            <div className="d-flex justify-content-between mt-5 mb-3">
              <div>
                <h2>Trainerliste</h2>
              </div>
              <div>
                <Card.Link
                  as={Link}
                  to="add-trainer"
                  className="btn btn-primary"
                >
                  Trainer hinzufügen
                </Card.Link>
              </div>
            </div>
            <DataTable
              fixedHeader
              columns={columns}
              data={filteredTrainers}
              pagination
              highlightOnHover
              // subHeader
              // subHeaderComponent={
              //   <input
              //     type="text"
              //     placeholder="Search here"
              //     className="w-25 form-control"
              //     value={search}
              //     onChange={(e) => setSearch(e.target.value)}
              //   />
              // }
            />
            {/* <ToastContainer /> */}
          </div>
        ) : (
          <>
            {/* <ToastContainer /> */}
            <AccessDenied />
          </>
        )}
      </>
    );
  } else {
    return <PreLoader />;
  }
}
