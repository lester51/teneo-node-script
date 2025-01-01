const form = document.getElementById('loginForm');
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const apikey = "OwAG3kib1ivOJG4Y0OCZ8lJETa6ypvsDtGmdhcjA";
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    try {
        const response = await fetch('https://auth.teneo.pro/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authority': 'auth.teneo.pro',
    // Uncomment these headers if you are facing issues in the request
    // 'accept-language': 'en-US,en;q=0.9',
    // 'origin': 'https://dashboard.teneo.pro',
    // 'referer': 'https://dashboard.teneo.pro/',
    // 'sec-ch-ua': '"Not-A.Brand";v="99", "Chromium";v="124"',
    // 'sec-ch-ua-mobile': '?0',
    // 'sec-ch-ua-platform': '"Linux"',
    // 'sec-fetch-dest': 'empty',
    // 'sec-fetch-mode': 'cors',
    // 'sec-fetch-site': 'same-site',
    // 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'x-api-key': apikey
            },
            body: JSON.stringify({
                email: data.email,
                password: data.password
            }),
            mode: "cors",
            credentials: "omit"
        });
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        let res1 = await response.json();
        if (response.ok) {
            await Swal.fire({
                title: 'Copy Your Login Token!',
                text: res1.access_token,
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