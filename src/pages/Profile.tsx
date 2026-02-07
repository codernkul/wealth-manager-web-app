import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';

const personalInfoSchema = yup.object().shape({
  full_name: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().optional(),
  date_of_birth: yup.string().optional(),
  address: yup.string().optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),
  zip_code: yup.string().optional(),
  country: yup.string().optional(),
});

const financialGoalsSchema = yup.object().shape({
  retirement_age: yup.number().min(50).max(100).required('Retirement age is required'),
  retirement_goal: yup.number().min(100000).required('Retirement goal is required'),
  risk_appetite: yup.string().oneOf(['conservative', 'moderate', 'aggressive']).required('Risk appetite is required'),
  investment_horizon: yup.string().oneOf(['short', 'medium', 'long']).required('Investment horizon is required'),
  monthly_contribution: yup.number().min(0).required('Monthly contribution is required'),
});

const passwordSchema = yup.object().shape({
  current_password: yup.string().required('Current password is required'),
  new_password: yup.string().min(8, 'Password must be at least 8 characters').required('New password is required'),
  confirm_password: yup.string().oneOf([yup.ref('new_password')], 'Passwords must match').required('Confirm password is required'),
});

interface PersonalInfoData {
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

interface FinancialGoalsData {
  retirement_age: number;
  retirement_goal: number;
  risk_appetite: 'conservative' | 'moderate' | 'aggressive';
  investment_horizon: 'short' | 'medium' | 'long';
  monthly_contribution: number;
}

interface PasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

interface SecurityQuestion {
  id: string;
  question: string;
  answer: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'personal' | 'financial' | 'security' | 'password'>('personal');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([
    { id: '1', question: 'What was your first pet\'s name?', answer: '' },
    { id: '2', question: 'What city were you born in?', answer: '' },
  ]);
  const [addQuestionDialog, setAddQuestionDialog] = useState(false);

  const {
    register: registerPersonal,
    handleSubmit: handlePersonalSubmit,
    formState: { errors: personalErrors },
    control: personalControl,
  } = useForm<PersonalInfoData>({
    resolver: yupResolver(personalInfoSchema) as any,
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      date_of_birth: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
    },
  });

  const {
    register: registerFinancial,
    handleSubmit: handleFinancialSubmit,
    formState: { errors: financialErrors },
    control: financialControl,
    watch: watchFinancial,
  } = useForm<FinancialGoalsData>({
    resolver: yupResolver(financialGoalsSchema) as any,
    defaultValues: {
      retirement_age: 65,
      retirement_goal: 1000000,
      risk_appetite: 'moderate',
      investment_horizon: 'long',
      monthly_contribution: 1000,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    watch: watchPassword,
  } = useForm<PasswordData>({
    resolver: yupResolver(passwordSchema) as any,
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onPersonalInfoSubmit = async (data: PersonalInfoData) => {
    try {
      setLoading(true);
      setMessage('');
      // await authService.updateProfile(data);
      setMessage('Personal information updated successfully!');
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const onFinancialGoalsSubmit = async (data: FinancialGoalsData) => {
    try {
      setLoading(true);
      setMessage('');
      // await authService.updateFinancialGoals(data);
      setMessage('Financial goals updated successfully!');
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordData) => {
    try {
      setLoading(true);
      setMessage('');
      // await authService.updatePassword(data);
      setMessage('Password updated successfully!');
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  const addSecurityQuestion = (question: string, answer: string) => {
    setSecurityQuestions([...securityQuestions, { id: Date.now().toString(), question, answer }]);
    setAddQuestionDialog(false);
  };

  const removeSecurityQuestion = (id: string) => {
    setSecurityQuestions(securityQuestions.filter(q => q.id !== id));
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getRiskScore = (riskAppetite: string) => {
    switch (riskAppetite) {
      case 'conservative': return 30;
      case 'moderate': return 60;
      case 'aggressive': return 90;
      default: return 50;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profile Settings
      </Typography>

      {message && (
        <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      <Box display="flex" gap={3}>
        {/* Sidebar Navigation */}
        <Box flex="0 0 25%">
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Settings
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Button
                variant={activeTab === 'personal' ? 'contained' : 'text'}
                onClick={() => setActiveTab('personal')}
                startIcon={<PersonIcon />}
                sx={{ justifyContent: 'flex-start' }}
              >
                Personal Info
              </Button>
              <Button
                variant={activeTab === 'financial' ? 'contained' : 'text'}
                onClick={() => setActiveTab('financial')}
                startIcon={<TrendingIcon />}
                sx={{ justifyContent: 'flex-start' }}
              >
                Financial Goals
              </Button>
              <Button
                variant={activeTab === 'security' ? 'contained' : 'text'}
                onClick={() => setActiveTab('security')}
                startIcon={<SecurityIcon />}
                sx={{ justifyContent: 'flex-start' }}
              >
                Security
              </Button>
              <Button
                variant={activeTab === 'password' ? 'contained' : 'text'}
                onClick={() => setActiveTab('password')}
                startIcon={<LockIcon />}
                sx={{ justifyContent: 'flex-start' }}
              >
                Password
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Main Content */}
        <Box flex="1">
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar
                  sx={{ width: 80, height: 80, mr: 3 }}
                  src={user?.profile_picture}
                >
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6">{user?.full_name || user?.username}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {user?.email}
                  </Typography>
                  <Chip
                    label={user?.is_verified ? 'Verified' : 'Not Verified'}
                    color={user?.is_verified ? 'success' : 'warning'}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              <Box component="form" onSubmit={handlePersonalSubmit(onPersonalInfoSubmit)}>
                <Box display="flex" flexWrap="wrap" gap={3}>
                  <Box flex="1 1 45%">
                    <TextField
                      fullWidth
                      label="Full Name"
                      {...registerPersonal('full_name')}
                      error={!!personalErrors.full_name}
                      helperText={personalErrors.full_name?.message}
                    />
                  </Box>
                  <Box flex="1 1 45%">
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      {...registerPersonal('email')}
                      error={!!personalErrors.email}
                      helperText={personalErrors.email?.message}
                    />
                  </Box>
                  <Box flex="1 1 45%">
                    <TextField
                      fullWidth
                      label="Phone"
                      {...registerPersonal('phone')}
                      error={!!personalErrors.phone}
                      helperText={personalErrors.phone?.message}
                    />
                  </Box>
                  <Box flex="1 1 45%">
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      {...registerPersonal('date_of_birth')}
                      error={!!personalErrors.date_of_birth}
                      helperText={personalErrors.date_of_birth?.message}
                    />
                  </Box>
                  <Box flex="1 1 100%">
                    <TextField
                      fullWidth
                      label="Address"
                      {...registerPersonal('address')}
                      error={!!personalErrors.address}
                      helperText={personalErrors.address?.message}
                    />
                  </Box>
                  <Box flex="1 1 30%">
                    <TextField
                      fullWidth
                      label="City"
                      {...registerPersonal('city')}
                      error={!!personalErrors.city}
                      helperText={personalErrors.city?.message}
                    />
                  </Box>
                  <Box flex="1 1 30%">
                    <TextField
                      fullWidth
                      label="State"
                      {...registerPersonal('state')}
                      error={!!personalErrors.state}
                      helperText={personalErrors.state?.message}
                    />
                  </Box>
                  <Box flex="1 1 30%">
                    <TextField
                      fullWidth
                      label="ZIP Code"
                      {...registerPersonal('zip_code')}
                      error={!!personalErrors.zip_code}
                      helperText={personalErrors.zip_code?.message}
                    />
                  </Box>
                  <Box flex="1 1 100%">
                    <TextField
                      fullWidth
                      label="Country"
                      {...registerPersonal('country')}
                      error={!!personalErrors.country}
                      helperText={personalErrors.country?.message}
                    />
                  </Box>
                  <Box flex="1 1 100%">
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                      {loading ? 'Updating...' : 'Update Personal Info'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Financial Goals Tab */}
          {activeTab === 'financial' && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Financial Goals & Risk Profile
              </Typography>

              <Box component="form" onSubmit={handleFinancialSubmit(onFinancialGoalsSubmit)}>
                <Box display="flex" flexWrap="wrap" gap={3}>
                  <Box flex="1 1 45%">
                    <TextField
                      fullWidth
                      label="Retirement Age"
                      type="number"
                      {...registerFinancial('retirement_age', { valueAsNumber: true })}
                      error={!!financialErrors.retirement_age}
                      helperText={financialErrors.retirement_age?.message}
                    />
                  </Box>
                  <Box flex="1 1 45%">
                    <TextField
                      fullWidth
                      label="Retirement Goal ($)"
                      type="number"
                      {...registerFinancial('retirement_goal', { valueAsNumber: true })}
                      error={!!financialErrors.retirement_goal}
                      helperText={financialErrors.retirement_goal?.message}
                    />
                  </Box>
                  <Box flex="1 1 45%">
                    <Controller
                      name="risk_appetite"
                      control={financialControl}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Risk Appetite</InputLabel>
                          <Select {...field} label="Risk Appetite">
                            <MenuItem value="conservative">Conservative</MenuItem>
                            <MenuItem value="moderate">Moderate</MenuItem>
                            <MenuItem value="aggressive">Aggressive</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Box>
                  <Box flex="1 1 45%">
                    <Controller
                      name="investment_horizon"
                      control={financialControl}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Investment Horizon</InputLabel>
                          <Select {...field} label="Investment Horizon">
                            <MenuItem value="short">Short Term (&lt; 3 years)</MenuItem>
                            <MenuItem value="medium">Medium Term (3-7 years)</MenuItem>
                            <MenuItem value="long">Long Term (&gt; 7 years)</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Box>
                  <Box flex="1 1 45%">
                    <TextField
                      fullWidth
                      label="Monthly Contribution ($)"
                      type="number"
                      {...registerFinancial('monthly_contribution', { valueAsNumber: true })}
                      error={!!financialErrors.monthly_contribution}
                      helperText={financialErrors.monthly_contribution?.message}
                    />
                  </Box>
                  <Box flex="1 1 100%">
                    <Card sx={{ mt: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Risk Profile Summary
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography variant="body2">
                            Risk Score:
                          </Typography>
                          <Box sx={{ flexGrow: 1, maxWidth: 200 }}>
                            <Box
                              sx={{
                                height: 8,
                                bgcolor: 'grey.300',
                                borderRadius: 4,
                                position: 'relative',
                              }}
                            >
                              <Box
                                sx={{
                                  height: '100%',
                                  width: `${getRiskScore(watchFinancial('risk_appetite'))}%`,
                                  bgcolor: 'primary.main',
                                  borderRadius: 4,
                                }}
                              />
                            </Box>
                          </Box>
                          <Typography variant="body2" fontWeight="bold">
                            {getRiskScore(watchFinancial('risk_appetite'))}/100
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                  <Box flex="1 1 100%">
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                      {loading ? 'Updating...' : 'Update Financial Goals'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Security Settings
              </Typography>

              <Box display="flex" flexDirection="column" gap={3}>
                <Box>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="subtitle1">Two-Factor Authentication</Typography>
                          <Typography variant="body2" color="textSecondary">
                            Add an extra layer of security to your account
                          </Typography>
                        </Box>
                        <Switch
                          checked={twoFactorEnabled}
                          onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                <Box>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="subtitle1">Email Notifications</Typography>
                          <Typography variant="body2" color="textSecondary">
                            Receive security alerts via email
                          </Typography>
                        </Box>
                        <Switch
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Box>

                <Box>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="subtitle1">Security Questions</Typography>
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => setAddQuestionDialog(true)}
                        >
                          Add Question
                        </Button>
                      </Box>
                      <List>
                        {securityQuestions.map((question) => (
                          <ListItem key={question.id}>
                            <ListItemText
                              primary={question.question}
                              secondary={question.answer ? 'Answer set' : 'No answer provided'}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                onClick={() => removeSecurityQuestion(question.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>

              <Box component="form" onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                <Box display="flex" flexDirection="column" gap={3}>
                  <Box>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type="password"
                      {...registerPassword('current_password')}
                      error={!!passwordErrors.current_password}
                      helperText={passwordErrors.current_password?.message}
                    />
                  </Box>
                  <Box display="flex" gap={3}>
                    <Box flex="1">
                      <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        {...registerPassword('new_password')}
                        error={!!passwordErrors.new_password}
                        helperText={passwordErrors.new_password?.message}
                      />
                    </Box>
                    <Box flex="1">
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        {...registerPassword('confirm_password')}
                        error={!!passwordErrors.confirm_password}
                        helperText={passwordErrors.confirm_password?.message}
                      />
                    </Box>
                  </Box>
                  <Box>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                      {loading ? 'Updating...' : 'Change Password'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Add Security Question Dialog */}
      <Dialog open={addQuestionDialog} onClose={() => setAddQuestionDialog(false)}>
        <DialogTitle>Add Security Question</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Question"
            margin="normal"
          />
          <TextField
            fullWidth
            label="Answer"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddQuestionDialog(false)}>Cancel</Button>
          <Button onClick={() => addSecurityQuestion('New Question', 'New Answer')}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
