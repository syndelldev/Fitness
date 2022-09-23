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

export default function EventList() {
  document.title = "Fitness | Veranstaltungsliste";
  const state = useSelector((state) => state);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isList, setIsList] = useState(true);
  const [isDeactivate, setIsDeactivate] = useState(true);

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
  const getEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select()
      .order("id", { ascending: false });
    setEvents(data);
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
    if (data[0].deactivate_rights !== 1) {
        setIsDeactivate(false);  
    }
    if (data[0].list_rights !== 1) {
      setIsList(false);
      setLoading(false);
    } else {
      getEvents();
    }
  };
  const handleChange = async (e, row_id) => {
    if (!isDeactivate){
        toast.error("Sie haben keinen Zugriff")
    }else{
        let value = e.target.value;
    const { data, error } = await supabase
      .from("events")
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
        const activeEventsData = await supabase
          .from("events")
          .select()
          .match({ id: row_id });
        
        if (data[0].status === 1) {
          toast.success("Ereignis aktiviert");
          logDesc =
            loggedUser.firstname +
            " has activated " +
            " event " +
            activeEventsData.data[0].name;
        } else {
          toast.error("Ereignis deaktiviert");
          logDesc =
            loggedUser.firstname +
            " has deactivated " +
            " event " +
            activeEventsData.data[0].name;
        }
        await supabase
          .from("admin_logs")
          .insert([
            {
              module: "Event",
              log_type: "Change Status",
              log_desc: logDesc,
              admin_id: loggedUser.id,
            },
          ])
          .single();
        let newJsonToAppend = [];
        events.forEach((event) => {
          if (event.id == row_id) {
            let eventToAppend = {
              ...event,
              status: parseInt(value) === 1 ? 0 : 1,
            };
            newJsonToAppend = [...newJsonToAppend, eventToAppend];
          } else {
            newJsonToAppend = [...newJsonToAppend, event];
          }
        });
        setEvents(newJsonToAppend);
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
      name: "Titel",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Typ",
      selector: (row) => row.type,
      sortable: true,
    },
    {
      name: "A",
      selector: (row) => row.a,
      sortable: true,
    },
    {
        name: "B",
        selector: (row) => row.b,
        sortable: true,
      },
      {
        name: "C",
        selector: (row) => row.c,
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
                history.push(`edit-event/${row.id}`);
              }}
            />
          </div>
        </div>
      ),
    },
  ];
  useEffect(() => {
    getEvents();
    getListRights();
  }, []);

  if (!loading) {
    return (
      <>      
        {isList ? (
          <div>    
            <div className="d-flex justify-content-between mt-5 mb-3">
              <div>
                <h2>Veranstaltungsliste</h2>
              </div>
              <div>
                <Card.Link
                  as={Link}
                  to="add-event"
                  className="btn btn-primary"
                >
                  Ereignis hinzufügen
                </Card.Link>
              </div>
            </div>
            <DataTable
              fixedHeader
              columns={columns}
              data={events}
              pagination
              highlightOnHover
            />
          </div>
          
        ) : (
          <>
            <AccessDenied />
          </>
        )}
      </>
    );
  } else {
    return <PreLoader />;
  }
}
