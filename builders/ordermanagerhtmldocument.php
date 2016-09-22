<?php

/**
 * Cart_OrderManagerHtmlDocument_Builder class file.
 *
 * @author Alexander Babayev <aleksander.babayev@gmail.com>
 * @copyright Copyright &copy; 2008-2015 Alexander Babayev
 */


// Load required classes
ClassLoader::loadBuilderClass('basic.abstract');


/**
 * HTML document builder
 *
 * @author Alexander Babayev <aleksander.babayev@gmail.com>
 * @copyright Copyright &copy; 2008-2015 Alexander Babayev
 * @created 2015.04.13
 */
class Cart2_OrderManagerHtmlDocument_Builder extends Basic_Abstract_Builder
{

    public function getByRequest(Request $_request = null)
    {
        $url = $_request->getUrl();
        $firstUrlToken = ($p = strpos($url, '/')) ? substr($url, 0, $p) : substr($url, 0);

        $userName = $_request->getParamValue('user');
        $mySql = Application::getService('basic.mysqlmanager');
        $user = $mySql->select('*', 'users', "`login` = '{$userName}'")->fetchAssoc();
        $user_role = $mySql->select('*', 'user_roles', "`id` = '{$user[user_role_id]}'")->fetchAssoc();
        $user = array(
            'id' => $user['id'],
            'login' => $user['login'],
            'role' => $user_role['name'],
        );

        // Store data in session
        $dbname = isset($_SESSION['MYSQL']['dbname']) ? $_SESSION['MYSQL']['dbname'] : MYSQL_DBNAME;
        $testMode = ($dbname == 'elektroz_demo');

        $modelClassName = str_replace('_Builder', '_Model', get_class($this));
        $model = new $modelClassName(array(
            'storage' => ($firstUrlToken == 'operatorrr'),
            'user' => $user,
            'testMode' => $testMode
        ));
        return $model;
    }

}

?>