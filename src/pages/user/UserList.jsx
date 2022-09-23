import { useHistory, Link } from "react-router-dom";
import { Card } from "@themesberg/react-bootstrap";
import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import DataTable from "react-data-table-component";
import { Spinner } from "@themesberg/react-bootstrap";
import { useSelector } from "react-redux";
import AccessDenied from "../widgets/AccessDenied";
import PreLoader from "../widgets/PreLoader";
import { format } from "date-fns";
import EditIcon from "@material-ui/icons/Edit";
import VisibilityIcon from '@material-ui/icons/Visibility';
import { toast } from 'react-toastify';

export default function UserList() {
  document.title = 'Fitness | Benutzerliste'
  const state = useSelector((state) => state);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFitleredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isList, setIsList] = useState(true);
  const [isDeactivate, setIsDeactivate] = useState(true)
  const history = useHistory();
  const [loggedUser, setLoggedUser] = useState([])
  const session = supabase.auth.session()
  const loggedUsers = async () => {
    const userData = await supabase.from("admin_users").select().match({email: session['user']['email']})
    setLoggedUser(userData.data[0])
  }
  useEffect(() => {
    loggedUsers();
  }, [])
  
  const getUsers = async () => {
    
    const { data } = await supabase.from("users").select().order("id", { ascending: false });
    setUsers(data);
    setFitleredUsers(data);
    setLoading(false);
  };
  const getListRights = async () => {
    setLoading(true);
    const userData = await supabase.from("admin_users").select().match({email: session['user']['email']})
    const { data } = await supabase.from("admin_rights").select().match({
      role_id: userData.data[0].role_id,
      page_id: 1,
    });
    if (data[0].deactivate_rights != 1) {
      setIsDeactivate(false);
    }
    if (data[0].list_rights != 1) {
      setIsList(false);
      setLoading(false);
    } else {
      getUsers();
    }
  };

  const handleChange = async (e, row_id) => {
    if (!isDeactivate){
      toast.error("Sie haben keinen Zugriff")
  }else{
    let value = e.target.value;
    const { data, error } = await supabase
      .from("users")
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
          .from("users")
          .select()
          .match({ id: row_id });
        if (data[0].status === 1) {
          toast.success("Benutzer aktiviert")
          logDesc =
            loggedUser.firstname +
            " has activated user " +
            activeUserData.data[0].firstname;
        } else {
          toast.error("Benutzer deaktiviert")
          logDesc =
            loggedUser.firstname +
            " has deactivated user " +
            activeUserData.data[0].firstname;
        }
        await supabase
          .from("admin_logs")
          .insert([
            {
              module: "User",
              log_type: "Change Status",
              log_desc: logDesc,
              admin_id: loggedUser.id,
            },
          ])
          .single();
        let newJsonToAppend = [];
        filteredUsers.forEach((user) => {
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
        console.log("newJsonToAppend", newJsonToAppend);
        setFitleredUsers(newJsonToAppend);
      }
    }}
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
      name: "Geschlecht",
      selector: (row) => row.gender,
      sortable: true,
    },
    {
      name: "Benutzername",
      selector: (row) => row.username,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => (
        // <label className="switch">
        //   <input id="switch-tog" type="checkbox" checked={row.status == 1 ? true : false} value={row.status} onChange={(e) => handleChange(e, row.id)} />
        //   <span className="slider round"></span>
        // </label>
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
                history.push(`edit-user/${row.id}`);
              }}
            />
          </div>
        
          <div className="mx-1 cursor-pointer">
            <VisibilityIcon 
            onClick={() => {
              history.push(`view-user/${row.id}`);
            }}
            />
          
          </div>
        </div>
      ),
    },
  ];
  useEffect(() => {
    getUsers();
    getListRights();
  }, []);

  useEffect(() => {
    getUsers();
  }, [search]);

  if (!loading) {
    return (
      <>
        {isList ? (
          <div>
            
            <div className="d-flex justify-content-between mt-5 mb-3">
              <div>
                {/* user list */}
                <h2>Benutzerliste</h2>
              </div>
              <div>
                <Card.Link as={Link} to="add-user" className="btn btn-primary">
                  {/* Add User */}
                  Nutzer hinzufügen
                </Card.Link>
              </div>
            </div>
            <DataTable
              fixedHeader
              columns={columns}
              data={filteredUsers}
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
          </div>
        ) : (
          <AccessDenied />
        )}
      </>
    );
  } else {
    return (
      <PreLoader/>
    );
  }
}
