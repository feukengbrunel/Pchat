import FavoritesPage from "../components/fav/Fav";

function FavoritesPages() {

    return (
        <>
            <div class="page-header">
                <h2 class="header-title">User</h2>
                <div class="header-sub-title">
                    <nav class="breadcrumb breadcrumb-dash">
                        <a href="#" class="breadcrumb-item"><i class="anticon anticon-plus-circle m-r-5"></i></a>
                        <a class="breadcrumb-item" href="#">Fav</a>
                    </nav>
                </div>
            </div>
            <FavoritesPage />
        </>

    );
}
export default FavoritesPages;