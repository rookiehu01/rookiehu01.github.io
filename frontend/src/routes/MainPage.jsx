import { useUser } from "../context/UserContext.jsx"
import Alert from "../components/Alert.jsx"
import { useNavigate } from "react-router"

const MainPage = () => {
  const { user } = useUser()
  const navigate = useNavigate()

  if (!user) {
    return <Alert title="Please log in" message={
      <>
        <button onClick={() => navigate("/login")} className="fancy-button">Log in here </button>
      </>
    } />
  }
  return (
    <div className="main-page title-div">
      <h1> Blogs </h1>
    </div>
  )
}

export default MainPage