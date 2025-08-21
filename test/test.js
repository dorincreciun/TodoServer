const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// Funcție pentru testarea endpoint-urilor
async function testAPI() {
  console.log('🧪 Începe testarea API-ului...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testare Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data.message);

    // Test 2: Înregistrare utilizator
    console.log('\n2. Testare înregistrare utilizator...');
    const registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'TestPass123',
      firstName: 'Test',
      lastName: 'User'
    };

    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    authToken = registerResponse.data.data.token;
    console.log('✅ Utilizator înregistrat:', registerResponse.data.message);

    // Test 3: Login
    console.log('\n3. Testare login...');
    const loginData = {
      email: 'test@example.com',
      password: 'TestPass123'
    };

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    authToken = loginResponse.data.data.token;
    console.log('✅ Login reușit:', loginResponse.data.message);

    // Test 4: Creare todo
    console.log('\n4. Testare creare todo...');
    const todoData = {
      title: 'Test Todo',
      description: 'Acesta este un todo de test',
      priority: 'high',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 zile de acum
      tags: ['test', 'demo']
    };

    const createTodoResponse = await axios.post(`${BASE_URL}/todos`, todoData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const todoId = createTodoResponse.data.data.todo._id;
    console.log('✅ Todo creat:', createTodoResponse.data.message);

    // Test 5: Obținere todo
    console.log('\n5. Testare obținere todo...');
    const getTodoResponse = await axios.get(`${BASE_URL}/todos/${todoId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Todo obținut:', getTodoResponse.data.data.todo.title);

    // Test 6: Listare todo-uri
    console.log('\n6. Testare listare todo-uri...');
    const listTodosResponse = await axios.get(`${BASE_URL}/todos`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Todo-uri listate:', listTodosResponse.data.data.todos.length, 'todo-uri găsite');

    // Test 7: Actualizare todo
    console.log('\n7. Testare actualizare todo...');
    const updateData = {
      title: 'Test Todo Actualizat',
      status: 'in_progress'
    };

    const updateTodoResponse = await axios.put(`${BASE_URL}/todos/${todoId}`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Todo actualizat:', updateTodoResponse.data.message);

    // Test 8: Marcare ca completat
    console.log('\n8. Testare marcare ca completat...');
    const completeResponse = await axios.patch(`${BASE_URL}/todos/${todoId}/complete`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Todo marcat ca completat:', completeResponse.data.message);

    // Test 9: Statistici
    console.log('\n9. Testare statistici...');
    const statsResponse = await axios.get(`${BASE_URL}/todos/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Statistici obținute:', statsResponse.data.data.stats);

    // Test 10: Ștergere todo
    console.log('\n10. Testare ștergere todo...');
    const deleteResponse = await axios.delete(`${BASE_URL}/todos/${todoId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Todo șters:', deleteResponse.data.message);

    // Test 11: Logout
    console.log('\n11. Testare logout...');
    const logoutResponse = await axios.post(`${BASE_URL}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Logout reușit:', logoutResponse.data.message);

    console.log('\n🎉 Toate testele au trecut cu succes!');
    console.log('\n📚 Documentația API este disponibilă la: http://localhost:3000/api-docs');

  } catch (error) {
    console.error('\n❌ Eroare în timpul testării:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Rulează testele dacă fișierul este executat direct
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI }; 