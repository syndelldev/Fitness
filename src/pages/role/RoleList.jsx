import { Link, useHistory } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import DataTable from "react-data-table-component";
import { Card } from "@themesberg/react-bootstrap";
import { format } from "date-fns";
import AccessDenied from "../widgets/AccessDenied";
import PreLoader from "../widgets/PreLoader";
import { useSelector } from "react-redux";
import EditIcon from "@material-ui/icons/Edit";

export default function DisciplineList() {
  document.title = 'Fitness | Rollenliste'
  const state = useSelector((state) => state);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredRoles, setFitleredRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isList, setIsList] = useState(true);
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
  const getRoles = async () => {
    const { data, error } = await supabase.from("admin_roles").select();
    setRoles(data);
    setFitleredRoles(data);
    setLoading(false);
  };
  const getListRights = async () => {
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
    if (data[0].list_rights !== 1) {
      setIsList(false);
      setLoading(false);
    } else {
      getRoles();
    }
  };

  const columns = [
    {
      name: "#",
      cell: (row, index) => index + 1,
    },
    {
      name: "Rollenname",
      selector: (row) => row.name,
      sortable: true,
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
              history.push(`edit-role/${row.id}`);
            }}
            />
          </div>
        </div>
        
      ),
    },
  ];
  useEffect(() => {
    getRoles();
    getListRights();
  }, []);

  useEffect(() => {
    const result = roles.filter((role) => {
      return role.name.toLowerCase().match(search.toLowerCase());
    });
    setFitleredRoles(result);
  }, [search]);

  if (!loading) {
    return (
      <>
        {isList ? (
          <div>
            <div className="d-flex justify-content-between mt-5 mb-3">
              <div>
                <h2>Rollenliste</h2>
              </div>
              <div>
                <Card.Link as={Link} to="add-role" className="btn btn-primary">
                  Rolle hinzufügen
                </Card.Link>
              </div>
            </div>
            <div>
              <DataTable
                fixedHeader
                columns={columns}
                data={filteredRoles}
                pagination
                highlightOnHover
              />
            </div>
          </div>
        ) : (
          <AccessDenied/>
        )}
      </>
    );
  } else {
    return (
      <PreLoader/>
    );
  }
}
