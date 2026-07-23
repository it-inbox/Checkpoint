import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { employeeService } from '../../services/employeeService';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  useTheme,
  Avatar,
  Stack,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

// Form Validation Schema
const schema = z.object({
  name: z.string().trim().min(3, 'Full Name must be at least 3 characters'),
  email: z.string().trim().email('Please enter a valid business email address'),
  phone: z.string().trim().min(5, 'Phone number must be at least 5 digits'),
  designation: z.string().trim().min(2, 'Designation is required'),
  department: z.string().trim().min(2, 'Department is required'),
  role: z.enum(['admin', 'employee']),
  status: z.enum(['active', 'inactive']),
});

type EmployeeFormValues = z.infer<typeof schema>;

export const CreateEmployee: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      designation: '',
      department: '',
      role: 'employee',
      status: 'active',
    },
  });

  // Create Mutation
  const mutation = useMutation({
    mutationFn: (formData: FormData) => employeeService.createEmployee(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEmployees'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardMetrics'] });
      navigate('/admin/employees');
    },
    onError: (err: any) => {
      setError(err?.message || 'Failed to register the new employee.');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFileError('Please select a valid image file (PNG/JPG/JPEG).');
        return;
      }
      setSelectedFile(file);
      setFileError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = (data: EmployeeFormValues) => {
    setError(null);
    setFileError(null);

    if (!selectedFile) {
      setFileError('Corporate profile picture is mandatory for biometric face registration.');
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('designation', data.designation);
    formData.append('department', data.department);
    formData.append('role', data.role);
    formData.append('status', data.status);
    formData.append('avatar', selectedFile);

    mutation.mutate(formData);
  };

  return (
    <Box sx={{ maxWidth: 850, mx: 'auto', width: '100%' }}>
      {/* Back button */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate('/admin/employees')}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        Back to Directory
      </Button>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Onboard New Employee
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Register a new corporate identity, assign departments, roles, and setup baseline permissions.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main Card Form */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              
              {/* Primary Personal Information Section */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: 'primary.main' }}>
                  1. Personal & Contact Information
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Baseline contact details of the incoming staff member.
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  placeholder="e.g. Richard Hendricks"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  disabled={mutation.isPending}
                  {...register('name')}
                  slotProps={{
                    input: {
                      startAdornment: <PersonIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Corporate Email Address"
                  placeholder="richard@checkpoint.io"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={mutation.isPending}
                  {...register('email')}
                  slotProps={{
                    input: {
                      startAdornment: <EmailIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  placeholder="+1 (555) 012-3456"
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  disabled={mutation.isPending}
                  {...register('phone')}
                  slotProps={{
                    input: {
                      startAdornment: <PhoneIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={mutation.isPending}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={previewUrl || undefined}
                      sx={{ width: 64, height: 64, border: '2px solid', borderColor: fileError ? 'error.main' : 'divider' }}
                    >
                      <PersonIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Button
                        variant="outlined"
                        component="span"
                        size="small"
                        startIcon={<CloudUploadIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={mutation.isPending}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                      >
                        Upload Profile Photo *
                      </Button>
                      {previewUrl && (
                        <Button
                          variant="text"
                          color="error"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={handleRemoveFile}
                          disabled={mutation.isPending}
                          sx={{ ml: 1, textTransform: 'none' }}
                        >
                          Remove
                        </Button>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Supported formats: JPG, PNG, JPEG. Mandatory for Face Matching.
                      </Typography>
                    </Box>
                  </Box>
                  {fileError && (
                    <FormHelperText error sx={{ mt: 1, fontWeight: 500 }}>
                      {fileError}
                    </FormHelperText>
                  )}
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              {/* Placement Section */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: 'primary.main' }}>
                  2. Organization Placement & Scope
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Departmental roles, titles, and system authorizations.
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Official Designation / Title"
                  placeholder="e.g. DevOps Lead"
                  error={!!errors.designation}
                  helperText={errors.designation?.message}
                  disabled={mutation.isPending}
                  {...register('designation')}
                  slotProps={{
                    input: {
                      startAdornment: <WorkIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Department / Cost Center"
                  placeholder="e.g. Engineering"
                  error={!!errors.department}
                  helperText={errors.department?.message}
                  disabled={mutation.isPending}
                  {...register('department')}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth error={!!errors.role}>
                  <InputLabel id="role-select-label">Access Authorization Role</InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="role-select"
                    label="Access Authorization Role"
                    disabled={mutation.isPending}
                    {...register('role')}
                  >
                    <MenuItem value="employee">Standard Employee</MenuItem>
                    <MenuItem value="admin">Platform Administrator</MenuItem>
                  </Select>
                  {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth error={!!errors.status}>
                  <InputLabel id="status-select-label">Initial Employment Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    id="status-select"
                    label="Initial Employment Status"
                    disabled={mutation.isPending}
                    {...register('status')}
                  >
                    <MenuItem value="active">Active Duty</MenuItem>
                    <MenuItem value="inactive">Suspended / Inactive</MenuItem>
                  </Select>
                  {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/employees')}
                  disabled={mutation.isPending}
                  sx={{ py: 1.25, px: 3 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={mutation.isPending}
                  startIcon={mutation.isPending ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  sx={{ py: 1.25, px: 4 }}
                >
                  {mutation.isPending ? 'Onboarding...' : 'Onboard Employee'}
                </Button>
              </Grid>

            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateEmployee;
