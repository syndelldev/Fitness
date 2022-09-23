import { Link, useHistory } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import DataTable from "react-data-table-component";
import { Card } from "@themesberg/react-bootstrap";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import EditIcon from "@material-ui/icons/Edit";
import PreLoader from "../widgets/PreLoader";
import AccessDenied from "../widgets/AccessDenied";
import { toast } from "react-toastify";

export default function DisciplineList() {
  document.title = "Fitness | Liste der Disziplinen";
  const [loading, setLoading] = useState(false);
  const [disciplines, setDisciplines] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredDisciplines, setFitleredDisciplines] = useState([]);
  const [isList, setIsList] = useState(true);
  const [loggedUser, setLoggedUser] = useState([]);
  const session = supabase.auth.session();
  const loggedUsers = async () => {
    const userData = await supabase
      .from("admin_users")
      .select()
      .match({ email: session["user"]["email"] });
    setLoggedUser(userData.data[0]);
  };
  useEffect(() => {
    loggedUsers();
  }, []);
  const history = useHistory();
  const state = useSelector((state) => state);
  const getDisciplines = async () => {
    const { data, error } = await supabase
      .from("cms_disciplines")
      .select()
      .order("id", { ascending: false });
    setDisciplines(data);
    setFitleredDisciplines(data);
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
      page_id: 3,
    });
    if (data[0].list_rights !== 1) {
      setIsList(false);
      setLoading(false);
    } else {
      getDisciplines();
    }
  };
  // const handleChange = async (e, row_id) => {
  //   let value = e.target.value;
  //   const { data, error } = await supabase
  //     .from("cms_disciplines")
  //     .update([
  //       {
  //         status: parseInt(value) === 1 ? 0 : 1,
  //       },
  //     ])
  //     .match({ id: row_id });
  //   if (error) {
  //     toast.error("Etwas ist schief gelaufen");
  //   } else {
  //     if (data) {
  //       let logDesc = "";
  //       const activeDiscData = await supabase
  //         .from("cms_disciplines")
  //         .select()
  //         .match({ id: row_id });
  //       if (data[0].status === 1) {
  //         logDesc =
  //           state.loggedUser.firstname +
  //           " has activated discipline " +
  //           activeDiscData.data[0].discipline_name;
  //           toast.success("Discipline activated.")
  //       } else {
  //         logDesc =
  //           state.loggedUser.firstname +
  //           " has deactivated discipline " +
  //           activeDiscData.data[0].discipline_name;
  //           toast.error("Discipline deactivated.")
  //       }
  //       await supabase
  //         .from("admin_logs")
  //         .insert([
  //           {
  //             module: "Discipline",
  //             log_type: "Change Status",
  //             log_desc: logDesc,
  //             admin_id: state.loggedUser.id,
  //           },
  //         ])
  //         .single();
  //       let newJsonToAppend = [];
  //       filteredDisciplines.forEach((user) => {
  //         if (user.id == row_id) {
  //           let userToAppend = {
  //             ...user,
  //             status: parseInt(value) === 1 ? 0 : 1,
  //           };
  //           newJsonToAppend = [...newJsonToAppend, userToAppend];
  //         } else {
  //           newJsonToAppend = [...newJsonToAppend, user];
  //         }
  //       });

  //       setFitleredDisciplines(newJsonToAppend);
  //     }
  //   }
  // };
  const columns = [
    {
      name: "#",
      cell: (row, index) => index + 1,
    },
    {
      name: "Name der Disziplin",
      selector: (row) => row.discipline_name,
      sortable: true,
    },
    // {
    //   name: "Status",
    //   cell: (row) => (
    //     <label className="switch">
    //       <input
    //         type="checkbox"
    //         checked={row.status == 1 ? true : false}
    //         value={row.status}
    //         onChange={(e) => handleChange(e, row.id)}
    //       />
    //       <span className="slider round"></span>
    //     </label>
    //   ),
    // },
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
                history.push(`edit-discipline/${row.id}`);
              }}
            />
          </div>
        </div>
      ),
    },
  ];
  useEffect(() => {
    getDisciplines();
    getListRights();
  }, []);

  useEffect(() => {
    const result = disciplines.filter((discipline) => {
      return discipline.discipline_name
        .toLowerCase()
        .match(search.toLowerCase());
    });
    setFitleredDisciplines(result);
  }, [search]);

  if (!loading) {
    return (
      <>
        {isList ? (
          <div>
            <div className="d-flex justify-content-between mt-5 mb-3">
              <div>
                <h2>Liste der Disziplinen</h2>
              </div>
              <div>
                <Card.Link
                  as={Link}
                  to="add-discipline"
                  className="btn btn-primary"
                >
                  Neue Disziplin hinzufügen
                </Card.Link>
                <Card.Link
                  as={Link}
                  to="add-discipline-level"
                  className="btn btn-primary"
                >
                  Disziplinebene hinzufügen
                </Card.Link>
              </div>
            </div>
            <div>
              <DataTable
                fixedHeader
                columns={columns}
                data={filteredDisciplines}
                pagination
                highlightOnHover
              />
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
