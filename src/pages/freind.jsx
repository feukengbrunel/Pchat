import FriendsPage from "../components/Freind/Freindpage";


function Freind() {

    return (
        <>
            <div class="page-header">
                <h2 class="header-title">User</h2>
                <div class="header-sub-title">
                    <nav class="breadcrumb breadcrumb-dash">
                        <a href="#" class="breadcrumb-item"><i class="anticon anticon-users m-r-5"></i></a>
                        <a class="breadcrumb-item" href="#">Freind</a>
                    </nav>
                </div>
            </div>
            <FriendsPage />
        </>

    );
}
export default Freind;