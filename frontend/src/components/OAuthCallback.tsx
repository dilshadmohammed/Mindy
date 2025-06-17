import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function OAuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        // Get the hash string from URL (after #)
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1)); // Remove '#'
        const accessToken = params.get('access_token');

        if (accessToken) {
            localStorage.setItem('access_token', accessToken);
            // Redirect to home or dashboard
            navigate('/chat');
        } else {
            // Handle error
            console.error('Access token not found in URL');
        }
    }, [navigate]);

    return <div>Processing login...</div>

}

export default OAuthCallback