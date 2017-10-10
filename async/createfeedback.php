<?php


// Load abstract action
ClassLoader::loadAsyncActionClass('basic.abstract');


class Basic_CreateFeedback_AsyncAction extends Basic_Abstract_AsyncAction
{
    /**
     * Performs the action
     */
    public function perform(array $_params = array())
    {
        $mySql = Application::getService('basic.mysqlmanager');
        $errors = array();

        $name = $this->checkFormField('name', $_params, true, $errors, 256);
        $phone = $this->checkFormField('phone', $_params, false, $errors, 256);
        $email = $this->checkFormField('email', $_params, false, $errors, 256);
        $question = $this->checkFormField('question', $_params, true, $errors, 4096);

        if (count($errors) > 0){
            throw new AsyncActionException(json_encode($errors));
        }

        $clientRec = compact('name','phone','email','question');

        // Insert order record
        $mySql->insert('feedbacks', $clientRec);
        $id = $mySql->getInsertId();
        $this->data['id'] = $id;

        $message = 'Получен новый Feedback:'."\n";
        $message.= 'Имя: '.$name."\n";
        if (!is_null($phone)) {
            $message.= 'Телефон: '.$phone."\n";
        }
        if (!is_null($email)) {
            $message.= 'E-Mail: '.$email."\n";
        }
        $message.= 'Вопрос: '."\n";
        $message.= $question;
        
        $to      = FEEDBACK_EMAIL;
        $subject = 'Feedback';
        $headers = 'From: elektroz@elektrozip.com';
        //$result = mail($to, $subject, $message, $headers);
        $this->mail($to, $subject, $message, $headers);

    }

    public function checkFormField($_key, $_params, $_required = false, &$errors, $_length = null)
    {
        $name = $_key;
        $value = isset($_params[$_key]) ? $_params[$_key] : null;
//		throw new AsyncActionException('params = '.implode(';',$_params).' value = '.$value);
        $reg = array(
            "name" => array('/^[a-zA-Zа-яА-Я ]+$/u', 'Не корректное имя'),
            "phone" => array('/^(\+?\d+)?\s*(\(?\d{3}\)?[\- ]?)?[\d\- ]{3,10}$/', 'Не верный формат телефона'),
            "email" => array('/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/i', 'Не верный формат email')
        );
        if ($_required  and  (is_null($value) or empty($value))){
            $errors[$name] = 'Это поле обязательно';
            return;
        }
//        throw new AsyncActionException('$value--'.$value);
        if (!empty($value)) {
//            var_dump($name . '-- ' . $value);
            if (isset($reg[$name])) {
                if (preg_match($reg[$name][0],$value) == 0){
                    $errors[$name] = $reg[$name][1];
                    return;
                }
            }
//			throw new AsyncActionException(json_encode('length'));
            if (!is_null($_length)) {
				//throw new AsyncActionException('length');
                if (mb_strlen($value, 'utf8') > $_length) {
                    $errors[$name] = 'Максимум '.$_length.' символов';
                    return;
                }
            }
        }
        if (empty($_params['phone']) and empty($_params['email'])) {
            $errors['phone'] = 'Введите либо телефон либо email';
            return;
        }
        return $value;
    }
}

?>