const form = document.getElementById('loginForm');
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlra25uZ3JneHV4Z2pocGxicGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0MzgxNTAsImV4cCI6MjA0MTAxNDE1MH0.DRAvf8nH1ojnJBc3rD_Nw6t1AV8X_g6gmY_HByG2Mag";
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const url = new URL('https://ikknngrgxuxgjhplbpey.supabase.co/auth/v1/token');
    url.searchParams.append('grant_type', 'password')
    try {
        const response = await fetch(url, {
        method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apikey,
                'authorization': 'Bearer '+apikey
            },
            body: JSON.stringify(data)
            
        });
        const res1 = await response.json();
        if (response.ok) {
            await Swal.fire({
                title: 'Copy your UserID!',
                text: res1.user.id,
                icon: 'success',
                confirmButtonText: 'OK'
            })
            form.reset();
        } else {
            await Swal.fire({
                title: 'Error!',
                text: data.msg,
                icon: 'error',
                confirmButtonText: 'Try Again'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});