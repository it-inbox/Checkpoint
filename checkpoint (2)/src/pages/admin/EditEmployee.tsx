import React, { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
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
  Alert,
  CircularProgress,
  Skeleton,
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

export const EditEmployee: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Fetch current employee data
  const { data: employee, isLoading, error: fetchError } = useQuery({
    queryKey: ['adminEmployee', id],
    queryFn: () => employeeService.getEmployee(id || ''),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
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

  // Populate form values when data loaded
  useEffect(() => {
    if (employee) {
      reset({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        designation: employee.designation,
        department: employee.department,
        role: employee.role,
        status: employee.status,
      });
      if (employee.avatarUrl) {
        setPreviewUrl(employee.avatarUrl);
      }
    }
  }, [employee, reset]);

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (formData: FormData) => employeeService.updateEmployee(id || '', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEmployees'] });
      queryClient.invalidateQueries({ queryKey: ['adminEmployee', id] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardMetrics'] });
      navigate('/admin/employees');
    },
    onError: (err: any) => {
      setError(err?.message || 'Failed to save updates to the employee.');
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

    if (!previewUrl && !selectedFile) {
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
    
    if (selectedFile) {
      formData.append('avatar', selectedFile);
    }

    updateMutation.mutate(formData);
  };

  if (fetchError) {
    return (
      <Box>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/admin/employees')} sx={{ mb: 2 }}>
          Back to Directory
        </Button>
        <Alert severity="error">Failed to fetch the requested employee. They may not exist.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 850, mx: 'auto', width: '100%' }}>
      {/* Back Button */}
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
          Edit Corporate Account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Modify the corporate parameters, title positioning, contact channels, or systems permissions for{' '}
          <span style={{ fontWeight: 700, color: theme.palette.primary.main }}>
            {employee?.name || 'Employee'}
          </span>
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
          {isLoading ? (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
              </Grid>
            </Grid>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                
                {/* Personal / Contact */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: 'primary.main' }}>
                    1. Personal & Contact Information
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Update the contact details of the employee.
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={updateMutation.isPending}
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
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={updateMutation.isPending}
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
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    disabled={updateMutation.isPending}
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
                      disabled={updateMutation.isPending}
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
                          disabled={updateMutation.isPending}
                          sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                          Upload Profile Photo
                        </Button>
                        {previewUrl && (
                          <Button
                            variant="text"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={handleRemoveFile}
                            disabled={updateMutation.isPending}
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

                {/* Scope */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: 'primary.main' }}>
                    2. Organization Placement & Scope
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Departmental settings and access controls.
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Official Designation / Title"
                    error={!!errors.designation}
                    helperText={errors.designation?.message}
                    disabled={updateMutation.isPending}
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
                    error={!!errors.department}
                    helperText={errors.department?.message}
                    disabled={updateMutation.isPending}
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
                      disabled={updateMutation.isPending || employee?.id === 'u1'} // Prevent admin from locking themselves out
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
                    <InputLabel id="status-select-label">Employment Status</InputLabel>
                    <Select
                      labelId="status-select-label"
                      id="status-select"
                      label="Employment Status"
                      disabled={updateMutation.isPending || employee?.id === 'u1'} // Prevent self-deactivation
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
                    disabled={updateMutation.isPending}
                    sx={{ py: 1.25, px: 3 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={updateMutation.isPending}
                    startIcon={updateMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    sx={{ py: 1.25, px: 4 }}
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Grid>

              </Grid>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EditEmployee;
