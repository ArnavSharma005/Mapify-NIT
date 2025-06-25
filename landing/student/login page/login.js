let rollbox = document.getElementById("roll");
let passbox = document.getElementById("pas");
let btn = document.getElementById("log");

btn.addEventListener('click', async (e) => {
    console.log("Login button clicked");
    e.preventDefault();
    
    
    console.log("Roll number:", rollbox.value);
    console.log("Password length:", passbox.value.length);
    
    if (!rollbox.value || !passbox.value) {
        alert("Please fill in all fields");
        return;
    }
    
    try {
        const url = `http://localhost:3000/studentdb/${rollbox.value}`;
        console.log("Fetching from URL:", url);
        
        const response = await fetch(url);
        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);
        
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Response data:", data);
        console.log("Data type:", typeof data);
        console.log("Data length:", Array.isArray(data) ? data.length : 'Not an array');
        
        if (!data || (Array.isArray(data) && data.length === 0)) {
            alert("User isn't registered");
            return;
        }
        
        const user = Array.isArray(data) ? data[0] : data;
        console.log("User object:", user);
        
        if (user && user.password === passbox.value) {
            console.log("Password match - logging in");
            localStorage.setItem('role', 'student');
            localStorage.setItem('user', JSON.stringify(user));
            window.location.href = '../student.html';
        } else {
            console.log("Password mismatch");
            console.log("Expected:", user?.password);
            console.log("Provided:", passbox.value);
            alert("Password is incorrect");
        }
        
    } catch (error) {
        console.error("Detailed error:", error);
        alert(`Login failed: ${error.message}`);
    }
});
