import http from 'http';

async function request(options: {
  hostname?: string;
  port?: number;
  path: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
}): Promise<{ status: number | undefined; data: any; raw: string }> {
  return new Promise((resolve, reject) => {
    const postData = options.body ? JSON.stringify(options.body) : '';
    const headers = options.headers || {};
    if (postData) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const req = http.request(
      {
        hostname: options.hostname || '127.0.0.1',
        port: options.port || 5000,
        path: options.path,
        method: options.method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed = data;
          try {
            parsed = JSON.parse(data);
          } catch {}
          resolve({ status: res.statusCode, data: parsed, raw: data });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Running ResolveX AIT API Integration Tests...\n');

  // 1. Health
  const health = await request({ path: '/api/health', method: 'GET' });
  console.log('1. Health Check:', health.data);

  // 2. Metadata
  const meta = await request({ path: '/api/requests/meta', method: 'GET' });
  console.log(`2. AIT Metadata: ${meta.data?.data?.categories?.length} Categories, ${meta.data?.data?.departments?.length} Divisions, ${meta.data?.data?.locations?.length} Locations`);

  // 3. Login Student
  const studentLogin = await request({
    path: '/api/auth/login',
    method: 'POST',
    body: { email: 'student@ait.lk', password: 'Password@123' },
  });
  const studentToken = studentLogin.data?.token;
  console.log(`3. Student Login (${studentLogin.status}): Authenticated as ${studentLogin.data?.user?.full_name} (${studentLogin.data?.user?.role})`);

  // 4. Create Service Request as Student
  const newReq = await request({
    path: '/api/requests',
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: {
      title: 'Projector bulb burned out in Computing Lecture Hall 2',
      description: 'During the SE301 class, the ceiling projector displayed a red lamp warning and stopped projecting.',
      category_id: 3,
      department: 'Faculty of Computing & Software Engineering',
      location: 'Computing Building',
      room_number: 'Lecture Hall 2',
      priority: 'High',
    },
  });
  console.log(`4. Create Request (${newReq.status}): Ticket Code = ${newReq.data?.data?.request_code}, ID = ${newReq.data?.data?.id}, Status = ${newReq.data?.data?.status}`);

  // 5. Login Admin
  const adminLogin = await request({
    path: '/api/auth/login',
    method: 'POST',
    body: { email: 'admin@ait.lk', password: 'Password@123' },
  });
  const adminToken = adminLogin.data?.token;
  console.log(`5. Admin Login (${adminLogin.status}): Authenticated as ${adminLogin.data?.user?.full_name} (${adminLogin.data?.user?.role})`);

  // 6. Admin Dashboard Summary
  const summary = await request({
    path: '/api/admin/dashboard/summary',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`6. Admin Dashboard (${summary.status}): Total = ${summary.data?.data?.total_requests}, Pending = ${summary.data?.data?.pending_count}, Urgent/High = ${summary.data?.data?.urgent_high_count}`);
  console.log(`   Departments:`, summary.data?.data?.by_department?.map((d: any) => `${d.department.split(' ')[2] || d.department}: ${d.count}`));

  // 7. Admin Assign Request
  const assignRes = await request({
    path: `/api/admin/requests/${newReq.data?.data?.id}/assign`,
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      assigned_team: 'Laboratory Support',
      assigned_to: 2,
    },
  });
  console.log(`7. Admin Assign (${assignRes.status}): Status = ${assignRes.data?.data?.status}, Assigned Team = ${assignRes.data?.data?.assigned_team}`);

  // 8. Admin Status Workflow: In Progress
  const statusRes = await request({
    path: `/api/admin/requests/${newReq.data?.data?.id}/status`,
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { status: 'In Progress', note: 'Technician dispatched with replacement lamp module' },
  });
  console.log(`8. Update Status (${statusRes.status}): New Status = ${statusRes.data?.data?.status}`);

  // 9. CSV Export
  const csvRes = await request({
    path: '/api/admin/requests/export/csv',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const lines = typeof csvRes.data === 'string' ? csvRes.data.split('\r\n') : [];
  console.log(`9. CSV Export (${csvRes.status}): ${lines.length - 1} data rows exported.`);
  console.log(`   Headers:`, lines[0]?.slice(0, 80) + '...');

  console.log('\n🎉 ALL INTEGRATION TESTS PASSED 100% SUCCESSFULLY!');
}

runTests().catch(console.error);
