// ./src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CheckPoint API',
      version: '1.0.0',
      description: 'Attendance Management System API',
      contact: {
        name: 'CheckPoint Technologies',
        email: 'support@checkpoint.io',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            employeeId: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'employee'] },
            status: { type: 'string', enum: ['active', 'inactive'] },
            designation: { type: 'string' },
            department: { type: 'string' },
            joinedDate: { type: 'string', format: 'date' },
            avatarUrl: { type: 'string' },
          },
        },
        AttendanceRecord: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            employeeId: { type: 'string' },
            employeeName: { type: 'string' },
            date: { type: 'string', format: 'date' },
            checkIn: { type: 'string', nullable: true },
            checkOut: { type: 'string', nullable: true },
            status: { 
              type: 'string', 
              enum: ['present', 'absent', 'late', 'half_day', 'auto_closed'] 
            },
            workingHours: { type: 'number' },
            notes: { type: 'string' },
          },
        },
        OrganizationSettings: {
          type: 'object',
          properties: {
            companyName: { type: 'string' },
            officeName: { type: 'string' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            radius: { type: 'number' },
            officeStartTime: { type: 'string' },
            officeEndTime: { type: 'string' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            token: { type: 'string' },
          },
        },
        CheckInRequest: {
          type: 'object',
          required: ['employeeId', 'employeeName'],
          properties: {
            employeeId: { type: 'string' },
            employeeName: { type: 'string' },
            latitude: { type: 'string' },
            longitude: { type: 'string' },
            accuracy: { type: 'string' },
            angle: { type: 'string' },
          },
        },
        CheckOutRequest: {
          type: 'object',
          required: ['employeeId'],
          properties: {
            employeeId: { type: 'string' },
          },
        },
        UserCreateRequest: {
          type: 'object',
          required: ['name', 'email', 'phone', 'role', 'designation', 'department'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'employee'] },
            designation: { type: 'string' },
            department: { type: 'string' },
          },
        },
        MetricsResponse: {
          type: 'object',
          properties: {
            totalEmployees: { type: 'number' },
            presentToday: { type: 'number' },
            lateToday: { type: 'number' },
            autoClosedToday: { type: 'number' },
            attendanceRate: { type: 'number' },
            weeklyStats: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'string' },
                  present: { type: 'number' },
                  late: { type: 'number' },
                  absent: { type: 'number' },
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management' },
      { name: 'Attendance', description: 'Attendance management' },
      { name: 'Settings', description: 'Organization settings' },
    ],
  },
  apis: ['./src/**/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);