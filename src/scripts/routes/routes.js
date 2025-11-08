import HomePage from '../pages/home/home-page';
import LoginPage from '../pages/login/login-page';
import RegisterPage from '../pages/register/register-page';
import AddStoryPage from '../pages/add-story/add-story-page';
import BookmarkPage from '../pages/bookmark/bookmark-page';

const routes = {
  '/': new HomePage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/add-story': new AddStoryPage(),
  '/bookmark': new BookmarkPage(),
};

export default routes;
