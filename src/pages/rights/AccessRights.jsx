import { useHistory, Link } from "react-router-dom";
import { Card } from "@themesberg/react-bootstrap";
import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import DataTable from "react-data-table-component";
import { Col, Row, Form } from "@themesberg/react-bootstrap";
import PreLoader from "../widgets/PreLoader";
import AccessDenied from "../widgets/AccessDenied";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

export default function AccessRights() {
  document.title = 'Fitness | Administratorrechte'
  const state = useSelector((state) => state);
  const [userRights, setUserRights] = useState([]);
  const [filteredUserRights, setFitleredUserRights] = useState([]);
  const [roles, setRoles] = useState([]);
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
  const changeRole = async (e) => {
    setLoading(true);
    let value = parseInt(e.target.value);
    if (!value) {
      const { data, error } = await supabase
        .from("admin_rights")
        .select();
      setUserRights(data);
      setFitleredUserRights(data);
    } else {
      const { data, error } = await supabase
        .from("admin_rights")
        .select()
        .eq("role_id", value);
      setUserRights(data);
      setFitleredUserRights(data);
    }
    setLoading(false);
  };

  const getRoles = async () => {
    const { data, error } = await supabase
      .from("admin_roles")
      .select()
      .eq("status", 1);
    if (error){
      toast.error("Etwas ist schief gelaufen")
    }else{
      if(data){
        setRoles(data);
      }
    }
  };

  useEffect(() => {
    // getUserRights();
    getRoles();
  }, []);
  const columns = [
    {
      name: "#",
      cell: (row, index) => index + 1,
    },
    {
      name: "Modul",
      selector: (row) => row.page_name,
      sortable: true,
    },
    {
      name: "Rolle",
      selector: (row) => row.role_name,
      sortable: true,
    },
    {
      name: "Rechte auflisten",
      cell: (row) => (
        <label>
          <input
            type="checkbox"
            disabled={row.role_id === 1 ? true : false}
            checked={row.list_rights === 1 ? true : false}
            value={row.list_rights}
            onChange={(e) => handleListChange(e, row.id)}
          />
        </label>
      ),
    },
    {
      name: "Rechte hinzufügen",
      cell: (row) => (
        <label>
          <input
            type="checkbox"
            disabled={row.role_id === 1 ? true : false}
            checked={row.add_rights === 1 ? true : false}
            value={row.add_rights}
            onChange={(e) => handleAddChange(e, row.id)}
          />
        </label>
      ),
    },
    {
      name: "Rechte bearbeiten",
      cell: (row) => (
        <label>
          <input
            type="checkbox"
            disabled={row.role_id === 1 ? true : false}
            checked={row.edit_rights === 1 ? true : false}
            value={row.edit_rights}
            onChange={(e) => handleEditChange(e, row.id)}
          />
        </label>
      ),
    },
    {
      name: "Rechte anzeigen",
      cell: (row) => (
        <label>
          <input
            type="checkbox"
            disabled={row.role_id === 1 ? true : false}
            checked={row.view_rights === 1 ? true : false}
            value={row.view_rights}
            onChange={(e) => handleViewChange(e, row.id)}
          />
        </label>
      ),
    },
    {
      name: "Rechte deaktivieren",
      cell: (row) => (
        <label>
          <input
            type="checkbox"
            disabled={row.role_id === 1 ? true : false}
            checked={row.deactivate_rights === 1 ? true : false}
            value={row.deactivate_rights}
            onChange={(e) => handleDeactivateChange(e, row.id)}
          />
        </label>
      ),
    },
  ];

  const handleListChange = async (e, row_id) => {
    let value = e.target.value;
    const { data, error } = await supabase
      .from("admin_rights")
      .update([
        {
          list_rights: parseInt(value) === 1 ? 0 : 1,
        },
      ])
      .match({ id: row_id });
    if (error) {
      toast.error("Etwas ist schief gelaufen");
    } else {
      if (data) {
        let newJsonToAppend = [];
        filteredUserRights.forEach((right) => {
          if (right.id === row_id) {
            let userToAppend = {
              ...right,
              list_rights: parseInt(value) === 1 ? 0 : 1,
            };
            newJsonToAppend = [...newJsonToAppend, userToAppend];
          } else {
            newJsonToAppend = [...newJsonToAppend, right];
          }
        });
        setFitleredUserRights(newJsonToAppend);
        toast.success("Zugang geändert")
      }
    }
  };
  const handleAddChange = async (e, row_id) => {
    let value = e.target.value;
    const { data, error } = await supabase
      .from("admin_rights")
      .update([
        {
          add_rights: parseInt(value) === 1 ? 0 : 1,
        },
      ])
      .match({ id: row_id });
    if (error) {
      toast.error("Etwas ist schief gelaufen");
    } else {
      if (data) {
        let newJsonToAppend = [];
        filteredUserRights.forEach((right) => {
          if (right.id === row_id) {
            let userToAppend = {
              ...right,
              add_rights: parseInt(value) === 1 ? 0 : 1,
            };
            newJsonToAppend = [...newJsonToAppend, userToAppend];
          } else {
            newJsonToAppend = [...newJsonToAppend, right];
          }
        });
        setFitleredUserRights(newJsonToAppend);
        toast.success("Zugang geändert")
      }
    }
  };
  const handleEditChange = async (e, row_id) => {
    let value = e.target.value;
    const { data, error } = await supabase
      .from("admin_rights")
      .update([
        {
          edit_rights: parseInt(value) === 1 ? 0 : 1,
        },
      ])
      .match({ id: row_id });
    if (error) {
      toast.error("Etwas ist schief gelaufen");
    } else {
      if (data) {
        let newJsonToAppend = [];
        filteredUserRights.forEach((right) => {
          if (right.id === row_id) {
            let userToAppend = {
              ...right,
              edit_rights: parseInt(value) === 1 ? 0 : 1,
            };
            newJsonToAppend = [...newJsonToAppend, userToAppend];
          } else {
            newJsonToAppend = [...newJsonToAppend, right];
          }
        });
        setFitleredUserRights(newJsonToAppend);
        toast.success("Zugang geändert")
      }
    }
  };
  const handleDeactivateChange = async (e, row_id) => {
    let value = e.target.value;
    const { data, error } = await supabase
      .from("admin_rights")
      .update([
        {
          deactivate_rights: parseInt(value) === 1 ? 0 : 1,
        },
      ])
      .match({ id: row_id });
    if (error) {
      toast.error("Etwas ist schief gelaufen");
    } else {
      if (data) {
        let newJsonToAppend = [];
        filteredUserRights.forEach((right) => {
          if (right.id === row_id) {
            let userToAppend = {
              ...right,
              deactivate_rights: parseInt(value) === 1 ? 0 : 1,
            };
            newJsonToAppend = [...newJsonToAppend, userToAppend];
          } else {
            newJsonToAppend = [...newJsonToAppend, right];
          }
        });
        setFitleredUserRights(newJsonToAppend);
        toast.success("Zugang geändert")
      }
    }
  };
  const handleViewChange = async (e, row_id) => {
    let value = e.target.value;
    const { data, error } = await supabase
      .from("admin_rights")
      .update([
        {
          view_rights: parseInt(value) === 1 ? 0 : 1,
        },
      ])
      .match({ id: row_id });
    if (error) {
      toast.error("Etwas ist schief gelaufen");
    } else {
      if (data) {
        let newJsonToAppend = [];
        filteredUserRights.forEach((right) => {
          if (right.id === row_id) {
            let userToAppend = {
              ...right,
              view_rights: parseInt(value) === 1 ? 0 : 1,
            };
            newJsonToAppend = [...newJsonToAppend, userToAppend];
          } else {
            newJsonToAppend = [...newJsonToAppend, right];
          }
        });
        setFitleredUserRights(newJsonToAppend);
        toast.success("Zugang geändert")
      }
    }
  };

  if (!loading) {
    return (
      <>
        {loggedUser.role_id === 1 ? (
    <div>
      <div className="d-flex justify-content-between mt-5 mb-3">
        <div>
          <h2>Administratorrechte</h2>
        </div>
      </div>
      <div>
        <Row>
          <Col md={6} className="mb-3">
            <Form.Group id="role">
              <Form.Label>Rolle</Form.Label>
              <Form.Select onChange={changeRole}>
                <option>Rolle auswählen</option>
                {roles.map((role) => (
                  <option value={role.id}>{role.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <DataTable
          fixedHeader
          columns={columns}
          data={filteredUserRights}
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
    return (
     <PreLoader />
    );
  }
}
