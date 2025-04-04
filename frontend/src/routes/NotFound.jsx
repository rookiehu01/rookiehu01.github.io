import Alert from "../components/Alert.jsx"
import { useNavigate } from "react-router"

function NotFound(){
    const navigate = useNavigate()
    return (
        <Alert title="404 Not Found" message="Wrong page" onClose={() => navigate("/")} />
    )
}

export default NotFound