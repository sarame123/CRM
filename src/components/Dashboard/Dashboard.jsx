import React, { useState, useEffect } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const role = "admin"; 
        const isToday = true; 

       
        const eventsResponse = await axios.get(
          "http://localhost/backend/Calender/getEvents.php",
          {
            params: { role: role, is_today: isToday },
          }
        );

        const tasksResponse = await axios.get("http://localhost/backend/Tasks/get_allTasks.php");
        const usersResponse = await axios.get("http://localhost/backend/fetch_users.php");

 
        if (Array.isArray(eventsResponse.data)) {
          setEvents(eventsResponse.data);
        } else {
          console.error("Expected events data to be an array");
          setEvents([]);
        }

        setTasks(tasksResponse.data);
        setUsers(usersResponse.data);
        processChartData(tasksResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data", error);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const processChartData = (tasks) => {
    const taskCountsByMonth = Array(12).fill(0); 
    tasks.forEach((task) => {
      const month = new Date(task.created_at).getMonth(); 
      taskCountsByMonth[month] += 1; 
    });

    setChartData({
      labels: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
      datasets: [
        {
          label: "Tasks Completed",
          data: taskCountsByMonth,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
        },
      ],
    });
  };

  const getTaskStats = (status) => {
    return tasks.filter((task) => task.status === status).length;
  };

  const today = new Date().toISOString().split("T")[0]; 


  const todayEvents = Array.isArray(events)
    ? events.filter((event) => {
        const eventDate = event.event_date.split("T")[0];
        return eventDate === today;
      })
    : [];

  return (
    <Box sx={{ padding: "20px", backgroundColor: "#F8F9FA" }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        Dashboard
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
       
          <Grid container item spacing={3} xs={12}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h5" sx={{ color: "var(--main-color)" }}>
                    New Users
                  </Typography>
                  <Typography variant="h5">{users.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ padding: "16px" }}>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ color: "var(--main-color)" }}
                >
                  Today's Events
                </Typography>
                {todayEvents.length > 0 ? (
                  todayEvents.map((event, index) => (
                    <Box key={index} sx={{ marginBottom: "10px" }}>
                      <Typography
                        variant="body1"
                        sx={{ color: "var(--main-color)" }}
                      >
                        {event.event_name}
                      </Typography>
                      <Typography variant="body2">
                        {event.start_time} - {event.end_time}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2">No events today.</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* المهام */}
          <Grid container item spacing={3} xs={12}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                Tasks
              </Typography>
            </Grid>
            {["To Do", "In Progress", "Completed"].map((status, index) => (
              <Grid key={index} item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" sx={{ color: "var(--main-color)" }}>
                      {status}
                    </Typography>
                    <Typography variant="h5">{getTaskStats(status)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* رسم بياني */}
          <Grid item xs={12}>
            <Paper sx={{ padding: "16px" }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                Tasks Progress (Monthly)
              </Typography>
              <Line data={chartData} />
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default Dashboard;
