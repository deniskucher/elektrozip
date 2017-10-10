<?php

    /**
     * Basic_CreateRequest_AsyncAction class file.
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     */
    
    
    // Load abstract action
    ClassLoader::loadAsyncActionClass('basic.abstract');
    

    /**
     * Create request action
     *
     * @author Alexander Babayev <aleksander.babayev@gmail.com>
     * @copyright Copyright &copy; 2008-2016 Alexander Babayev <aleksander.babayev@gmail.com>
     * @since 2014.11.12
     */
    class Basic_CreateRequest_AsyncAction extends Basic_Abstract_AsyncAction
    {
        
        /**
         * Performs the action
         */
        public function perform(array $_params = array())
        {
            $mySqlManager = Application::getService('basic.mysqlmanager');
            $mySqlManager->startTransaction();
            
            
            // Extract inputs
            $formId = $this->_getString('formId', $_params, false, 'Unspecified');
            
            $data = array();
            if ($formId == 'Price Match')
                $data = $this->getPriceMatchData($_params);
            elseif ($formId == 'Careers')
                $data = $this->getCareersData($_params);
            
            
            // Create request record
            $request = array(
                'formId' => $formId,
                'data' => json_encode($data),
            );
            $requestId = $mySqlManager->insert('requests', $request)->getInsertId();
            
            
            $mySqlManager->commit();
            $this->data['requestId'] = $requestId;
            

            require(LIBS_DIR_PATH.'PHPMailer_5.2.4/class.phpmailer.php');
            $phpMailer = new PHPMailer();
            $phpMailer->IsSMTP();
            $phpMailer->Host = 'dedrelay.secureserver.net';
            $phpMailer->CharSet = 'utf-8';
            
            $phpMailer->From = 'support@chat2customers.com';
            $phpMailer->FromName = 'Chat2Customers.com';
            $phpMailer->Subject = 'New form request';
            
            $body = 'Dear Support,'."\r\n";
            $body .= 'You have a new request from '.$data['name'].(!empty($data['company'])?', at '.$company:'').'.'."\r\n";
            $body .= 'Please login to: http://chat2customers.com/clients/so/operator to process the request.'."\r\n";
            $body .= "\r\n";
            $body .= '--------------------------------------------------------------------------------'."\r\n";
            $body .= $this->getEmailRequestProperties($formId, $data);
            $phpMailer->Body = $body;
            
            foreach (explode(',', MAILBOX_EMAIL) as $recipient)
                $phpMailer->AddAddress(trim($recipient));
            
            $mailResult = $phpMailer->Send();
        }
        
        
        protected function getEmailRequestProperties($_formId, $_data)
        {
            $props = 'Name: '.$_data['name']."\r\n";
            
            
            if ($_formId == 'Price Match')
            {
                $props .= 'Company: '.$_data['company']."\r\n";
                $props .= 'Telephone: '.$_data['telephone']."\r\n";
                $props .= 'E-Mail: '.$_data['email']."\r\n";
                $props .= "\r\n".'Request: '."\r\n".$_data['items']."\r\n";
                $props .= "\r\n".'Message: '."\r\n".$_data['message']."\r\n";
            }
            
            elseif ($_formId == 'Careers')
            {
                $props .= 'Current employer: '.$_data['currentEmployer']."\r\n";
                $props .= 'Telephone: '.$_data['telephone']."\r\n";
                $props .= 'E-Mail: '.$_data['email']."\r\n";
                $props .= 'Expect salary: '.$_data['expectedSalary']."\r\n";
                $props .= 'Current job title: '.$_data['currentJobTitle']."\r\n";
                $props .= "\r\n".'Current duties: '."\r\n".$_data['currentDuties']."\r\n";
                $props .= "\r\n".'Business address: '."\r\n".$_data['businessAddress']."\r\n";
                $props .= "\r\n".'Qualifications: '."\r\n".$_data['qualifications']."\r\n";
                $props .= "\r\n".'Working history: '."\r\n".$_data['workingHistory']."\r\n";
            }
            
            
            return $props;
        }
        
        
        protected function getPriceMatchData($_params = array())
        {
            $name = $this->_getString('name', $_params, false, '');
            if ($name == '') throw new AsyncActionException('Please, enter your name.');
            
            $company = $this->_getString('company', $_params, false, '');
            if ($company == '') throw new AsyncActionException('Please, enter your company name.');
            
            $telephone = $this->_getString('telephone', $_params, false, '');
            if ($telephone == '') throw new AsyncActionException('Please, enter your telephone number.');
            
            $email = $this->_getString('email', $_params, false, '');
            if ($email == '') throw new AsyncActionException('Please, enter your e-mail.');
            if (preg_match(EMAIL_PATTERN, $email) == 0) throw new AsyncActionException('Please, enter a valid e-mail address.');
            
            $items = $this->_getString('items', $_params, false, '');
            if ($items == '') throw new AsyncActionException('Please, list the item numbers and prices you\'d like to pay.');
            if (strlen($items) > 1024) throw new AsyncActionException('Items data is too long.');
            
            $message = $this->_getString('message', $_params, false, '');
            if (strlen($message) > 1024) throw new AsyncActionException('Message is too long.');
            
            return array(
                'name' => $name,
                'company' => $company,
                'telephone' => $telephone,
                'email' => $email,
                'items' => $items,
                'message' => $message,
            );
        }
        
        protected function getCareersData($_params = array())
        {
            $name = $this->_getString('name', $_params, false, '');
            if ($name == '') throw new AsyncActionException('Please, enter your name.');
            
            $currentEmployer = $this->_getString('currentEmployer', $_params, false, '');
            if ($currentEmployer == '') throw new AsyncActionException('Please, enter your current employer.');
            
            $telephone = $this->_getString('telephone', $_params, false, '');
            if ($telephone == '') throw new AsyncActionException('Please, enter your telephone number.');
            
            $email = $this->_getString('email', $_params, false, '');
            if ($email == '') throw new AsyncActionException('Please, enter your e-mail.');
            if (preg_match(EMAIL_PATTERN, $email) == 0) throw new AsyncActionException('Please, enter a valid e-mail address.');
            
            $expectedSalary = $this->_getString('expectedSalary', $_params, false, '');
            if ($expectedSalary == ''  or  $expectedSalary == '$') throw new AsyncActionException('Please, enter your expected salary.');
            
            $currentJobTitle = $this->_getString('currentJobTitle', $_params, false, '');
            if ($currentJobTitle == '') throw new AsyncActionException('Please, enter your current job title.');
            
            $currentDuties = $this->_getString('currentDuties', $_params, false, '');
            if (strlen($currentDuties) > 1024) throw new AsyncActionException('Current duties is too long.');
            
            $businessAddress = $this->_getString('businessAddress', $_params, false, '');
            if (strlen($businessAddress) > 1024) throw new AsyncActionException('Business address is too long.');
            
            $qualifications = $this->_getString('qualifications', $_params, false, '');
            if (strlen($qualifications) > 1024) throw new AsyncActionException('Qualifications is too long.');
            
            $workingHistory = $this->_getString('workingHistory', $_params, false, '');
            if (strlen($workingHistory) > 1024) throw new AsyncActionException('Working history is too long.');
            
            return array(
                'name' => $name,
                'currentEmployer' => $currentEmployer,
                'telephone' => $telephone,
                'email' => $email,
                'expectedSalary' => $expectedSalary,
                'currentJobTitle' => $currentJobTitle,
                'currentDuties' => $currentDuties,
                'businessAddress' => $businessAddress,
                'qualifications' => $qualifications,
                'workingHistory' => $workingHistory,
            );
        }
        
    }

?>