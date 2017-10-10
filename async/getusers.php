<?php


// Load abstract action
ClassLoader::loadAsyncActionClass('basic.abstract');


/**
 * Get users action
 *
 * @author Alexander Babayev <aleksander.babayev@gmail.com>
 * @copyright Copyright &copy; 2008-2016 Alexander Babayev
 * @created 2016.07.26
 */
class Basic_GetUsers_AsyncAction extends Basic_Abstract_AsyncAction
{

    /**
     * Performs the action
     */
    public function perform(array $_params = array())
    {
        $mySql = Application::getService('basic.mysqlmanager');

        // Extract inputs
        $query = $this->_getString('query', $_params, false, null);
        $roleId = $this->_getString('role', $_params, false, null);


        // Query cities
        if($roleId)
            $criteria = is_null($query) ? '1' : '(`name` LIKE \'%'.mysql_real_escape_string($query).'%\' OR `login` LIKE \'%'.mysql_real_escape_string($query).'%\') AND `role` = \''.mysql_real_escape_string($roleId).'\'';
        else
            $criteria = is_null($query) ? '1' : '`name` LIKE \'%'.mysql_real_escape_string($query).'%\' OR `login` LIKE \'%'.mysql_real_escape_string($query).'%\'';
        $this->data['records'] = $mySql->getRecords('users', $criteria, '`name`');
    }

}

?>