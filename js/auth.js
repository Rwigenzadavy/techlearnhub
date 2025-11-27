// ========================================
// AUTHENTICATION FUNCTIONS
// ========================================

// ========================================
// SIGN UP NEW USER
// ========================================
async function signUpUser() {
    var nameInput = document.getElementById('register-name');
    var emailInput = document.getElementById('register-email');
    var passwordInput = document.getElementById('register-password');
    
    var userName = nameInput.value;
    var userEmail = emailInput.value;
    var userPassword = passwordInput.value;
    
    if (userName === '' || userEmail === '' || userPassword === '') {
        alert('Please fill in all fields');
        return;
    }
    
    if (userPassword.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: userEmail,
            password: userPassword,
            options: {
                data: {
                    name: userName
                }
            }
        });
        
        if (error) {
            alert('Error: ' + error.message);
            return;
        }
        
        console.log('Auth user created:', data.user.id);
        
        // Check if user already exists in users table
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('id', data.user.id)
            .maybeSingle();
        
        console.log('Checking existing user:', existingUser, checkError);
        
        // Only insert if user doesn't exist
        if (!existingUser) {
            const { data: insertData, error: insertError } = await supabase
                .from('users')
                .insert([
                    { 
                        id: data.user.id,
                        email: userEmail,
                        name: userName
                    }
                ])
                .select();
            
            if (insertError) {
                console.error('Error inserting user:', insertError);
                alert('Error creating user profile: ' + insertError.message);
                return;
            }
            
            console.log('User profile created successfully:', insertData);
        }
        
        loggedInUser = {
            id: data.user.id,
            name: userName,
            email: userEmail,
            courses: []
        };
        
        await loadUserProgress();
        
        saveToLocalStorage();
        updateNavigationBar();
        goToPage('home');
        alert('Welcome, ' + userName + '! Please check your email to verify your account.');
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

// ========================================
// SIGN IN EXISTING USER
// ========================================
async function signInUser() {
    var emailInput = document.getElementById('login-email');
    var passwordInput = document.getElementById('login-password');
    
    var userEmail = emailInput.value;
    var userPassword = passwordInput.value;
    
    if (userEmail === '' || userPassword === '') {
        alert('Please fill in all fields');
        return;
    }
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: userPassword
        });
        
        if (error) {
            alert('Wrong email or password');
            return;
        }
        
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();
        
        if (userError) {
            console.error('Error fetching user:', userError);
            
            // If user doesn't exist in users table, create it
            if (userError.code === 'PGRST116') {
                const userName = data.user.user_metadata?.name || data.user.email.split('@')[0];
                
                const { error: insertError } = await supabase
                    .from('users')
                    .insert([
                        { 
                            id: data.user.id,
                            email: data.user.email,
                            name: userName
                        }
                    ]);
                
                if (insertError) {
                    console.error('Error creating user profile:', insertError);
                }
            }
        }
        
        loggedInUser = {
            id: data.user.id,
            name: userData ? userData.name : (data.user.user_metadata?.name || data.user.email.split('@')[0]),
            email: data.user.email,
            courses: []
        };
        
        await loadUserEnrollments();
        await loadUserProgress();
        
        saveToLocalStorage();
        updateNavigationBar();
        goToPage('home');
        alert('Welcome back, ' + loggedInUser.name + '!');
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

// ========================================
// LOG OUT USER
// ========================================
async function logOutUser() {
    await supabase.auth.signOut();
    
    loggedInUser = null;
    localStorage.removeItem('loggedInUser');
    
    var dashboardLink = document.getElementById('dashboard-link');
    var dashboardLinkMobile = document.getElementById('dashboard-link-mobile');
    if (dashboardLink) dashboardLink.classList.add('hidden');
    if (dashboardLinkMobile) dashboardLinkMobile.classList.add('hidden');
    
    location.reload();
}

// ========================================
// SWITCH BETWEEN SIGN UP AND SIGN IN
// ========================================
function switchForm() {
    var signupForm = document.getElementById('signup-form');
    var signinForm = document.getElementById('signin-form');
    
    var signupHidden = signupForm.classList.contains('hidden');
    
    if (signupHidden) {
        signupForm.classList.remove('hidden');
        signinForm.classList.add('hidden');
    } else {
        signupForm.classList.add('hidden');
        signinForm.classList.remove('hidden');
    }
}
