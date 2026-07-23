import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { attendanceService } from '../../services/attendanceService';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Divider,
  LinearProgress,
  IconButton,
  Skeleton,
  useTheme,
  ButtonBase,
} from '@mui/material';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  People as PeopleIcon,
  CheckCircle as PresentIcon,
  Warning as LateIcon,
  Autorenew as AutoClosedIcon,
  Settings as SettingsIcon,
  Assessment as ReportIcon,
  PersonAdd as AddEmployeeIcon,
  Refresh as RefreshIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Fetch admin dashboard metrics
  const { data: metrics, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['adminDashboardMetrics'],
    queryFn: () => attendanceService.getAdminDashboardMetrics(),
  });

  const topCards = [
    {
      title: 'Total Employees',
      value: metrics?.totalEmployees ?? 0,
      icon: <PeopleIcon sx={{ fontSize: 28, color: 'primary.main' }} />,
      bgColor: 'primary.light',
      description: 'Active personnel registered',
      path: '/admin/employees',
    },
    {
      title: 'Present Today',
      value: metrics?.presentToday ?? 0,
      icon: <PresentIcon sx={{ fontSize: 28, color: 'success.main' }} />,
      bgColor: 'success.light',
      description: 'Currently clocked-in on time',
      path: '/admin/reports',
    },
    {
      title: 'Late Today',
      value: metrics?.lateToday ?? 0,
      icon: <LateIcon sx={{ fontSize: 28, color: 'warning.main' }} />,
      bgColor: 'warning.light',
      description: 'Arrived after 9:15 AM threshold',
      path: '/admin/reports',
    },
    {
      title: 'Auto Closed',
      value: metrics?.autoClosedToday ?? 0,
      icon: <AutoClosedIcon sx={{ fontSize: 28, color: 'secondary.main' }} />,
      bgColor: 'secondary.light',
      description: 'Missed clock-outs yesterday',
      path: '/admin/reports',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Company-wide real-time attendance insights, personnel audits, and geofence tracking.
          </Typography>
        </Box>
        <IconButton onClick={() => refetch()} disabled={isLoading || isFetching} size="small" sx={{ border: `1px solid ${theme.palette.divider}` }}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {isLoading ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={3}>
              {[1, 2, 3, 4].map((i) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                  <Skeleton variant="rectangular" height={130} sx={{ borderRadius: 3 }} />
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {/* Metrics Row */}
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={3}>
              {topCards.map((card) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.title}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                      },
                    }}
                  >
                    <ButtonBase
                      onClick={() => navigate(card.path)}
                      sx={{
                        width: '100%',
                        textAlign: 'left',
                        display: 'block',
                        p: 0,
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {card.title}
                          </Typography>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 1.25,
                              borderRadius: 2.5,
                              bgcolor: card.bgColor,
                              display: 'flex',
                            }}
                          >
                            {card.icon}
                          </Paper>
                        </Box>

                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                          {card.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {card.description}
                        </Typography>
                      </CardContent>
                    </ButtonBase>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Attendance Graph Card */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Attendance Analytics (Weekly Trend)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    LAST 5 BUSINESS DAYS
                  </Typography>
                </Box>

                <Box sx={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={metrics?.weeklyStats || []}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 500 }} />
                      <YAxis tick={{ fontSize: 11, fontWeight: 500 }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600, marginTop: 10 }} />
                      <Bar dataKey="present" name="On Time" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="late" name="Late Check-In" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Stats Summary & Quick Actions */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Today's Stats Progress Ring Card */}
            <Card sx={{ borderRadius: 3, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, mb: 2 }}>
                  TODAY'S LOGISTICS COVERAGE
                </Typography>

                <Box sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      Attendance Rate
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {metrics?.attendanceRate || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={metrics?.attendanceRate || 0}
                    sx={{ height: 8, borderRadius: 4, mb: 2 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                    The portion of registered employees who have checked in successfully today.
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2.5 }} />

                {/* Quick Stats list */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Required Workday Shifts
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {metrics?.totalEmployees || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Late Exceptions Today
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'warning.main' }}>
                      {metrics?.lateToday || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Absent Notifications
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>
                      {Math.max(0, (metrics?.totalEmployees || 0) - (metrics?.presentToday || 0))}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Quick Actions Panel */}
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, mb: 2.5 }}>
                  ADMINISTRATIVE ACTIONS
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddEmployeeIcon />}
                    onClick={() => navigate('/admin/employees/new')}
                    sx={{ py: 1.25, justifyContent: 'flex-start', borderRadius: 2 }}
                  >
                    Onboard New Employee
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ReportIcon />}
                    onClick={() => navigate('/admin/reports')}
                    sx={{ py: 1.25, justifyContent: 'flex-start', borderRadius: 2 }}
                  >
                    Execute Attendance Audit
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    onClick={() => navigate('/admin/settings')}
                    sx={{ py: 1.25, justifyContent: 'flex-start', borderRadius: 2 }}
                  >
                    Configure Office Geofence
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminDashboard;
