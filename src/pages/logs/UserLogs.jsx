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


export default function UserLogs() {
  document.title = 'Fitness | Benutzer protokolle'
  const state = useSelector((state) => state);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredLogs, setFitleredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loggedUser, setLoggedUser] = useState([])
  const session = supabase.auth.session()
  const loggedUsers = async () => {
    const userData = await supabase.from("admin_users").select().match({email: session['user']['email']})
    setLoggedUser(userData.data[0])
  }
  useEffect(() => {
    loggedUsers();
  }, [])
  const getLogs = async () => {
    setLoading(true);
    const { data } = await supabase.from("admin_logs").select().order("id", { ascending: false });
    setLogs(data);
    setFitleredLogs(data);
    setLoading(false);
  };

  const columns = [
    {
      name: "#",
      maxWidth:'150px',
      cell: (row, index) => index + 1,
    },
    {
      name: "Modul",
      selector: (row) => row.module,
      sortable: true,
      maxWidth: '300px'
    },
    {
      name: "Protokolltyp",
      selector: (row) => row.log_type,
      sortable: true,
      maxWidth: '300px'
    },
    {
      name: "Protokollbeschreibung",
      selector: (row) => row.log_desc,
      sortable: true,
    },
    {
      name: "Zeit",
      selector: (row) => format(new Date(row.created_at), "HH:mm:ss"),
      sortable: true,
      maxWidth: '200px'
    },
    {
      name: "Datum",
      selector: (row) => format(new Date(row.created_at), "yyyy-MM-dd"),
      sortable: true,
      maxWidth: '200px'
    },
  ];
  useEffect(() => {
    getLogs();
  }, []);

  useEffect(() => {
    setFitleredLogs();
  }, [search]);

  if (!loading) {
    return (
      <>
        {loggedUser.role_id === 1 ? (
          <div>
            <div className="d-flex justify-content-between mt-5 mb-3">
              <div>
                {/* user logs */}
                <h2>Benutzer protokolle</h2>
              </div>
            </div>
            <DataTable
              fixedHeader
              columns={columns}
              data={filteredLogs}
              pagination
              highlightOnHover
            />
          </div>
        ) : (
         <AccessDenied />
        )}
      </>
    );
  } else {
    return (
     <PreLoader />
    );
  }
}
