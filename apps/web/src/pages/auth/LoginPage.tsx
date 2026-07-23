import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  InputAdornment,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Fingerprint as FingerprintIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

// Zod validation schema
const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid business email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const theme = useTheme();
  
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (email: string) => {
    setValue('email', email);
    setValue('password', 'password123');
    setError(null);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
        position: 'relative',
        backgroundImage: theme.palette.mode === 'light'
          ? 'radial-gradient(#4f46e510 1px, transparent 1px)'
          : 'radial-gradient(#818cf80a 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <Box sx={{ width: 'full', maxWidth: 450 }}>
        {/* Brand Header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Paper
              elevation={2}
              sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FingerprintIcon sx={{ fontSize: 32 }} />
            </Paper>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.05em' }}>
              Check<span style={{ color: theme.palette.primary.main }}>Point</span>
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Enterprise Geofenced Attendance Management
          </Typography>
        </Box>

        {/* Login Card */}
        <Card sx={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Welcome back
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your corporate credentials to access the portal
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  variant="outlined"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={isSubmitting}
                  {...register('email')}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  disabled={isSubmitting}
                  {...register('password')}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            disabled={isSubmitting}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Button
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{ py: 1.5, mt: 1, borderRadius: 2 }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Sign In to Portal'
                  )}
                </Button>
              </Box>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                DEMO LOGIN ACCOUNTS
              </Typography>
            </Divider>

            {/* Quick Login Assist Panels */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={() => handleQuickLogin('sarah.connor@checkpoint.io')}
                disabled={isSubmitting}
                startIcon={<AdminIcon />}
                sx={{
                  justifyContent: 'flex-start',
                  px: 2,
                  py: 1,
                  borderStyle: 'dashed',
                  '&:hover': { borderStyle: 'solid' },
                }}
              >
                <Box sx={{ textAlign: 'left', flexGrow: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block' }}>
                    ADMINISTRATOR
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    sarah.connor@checkpoint.io
                  </Typography>
                </Box>
              </Button>

              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                onClick={() => handleQuickLogin('john.miller@checkpoint.io')}
                disabled={isSubmitting}
                startIcon={<PersonIcon />}
                sx={{
                  justifyContent: 'flex-start',
                  px: 2,
                  py: 1,
                  borderStyle: 'dashed',
                  '&:hover': { borderStyle: 'solid' },
                }}
              >
                <Box sx={{ textAlign: 'left', flexGrow: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'secondary.main', display: 'block' }}>
                    STANDARD EMPLOYEE
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    john.miller@checkpoint.io
                  </Typography>
                </Box>
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default LoginPage;
