<?php

ini_set('display_errors','0');
error_reporting(E_ALL);

header('Access-Control-Allow-Origin:*');
header('Content-Type: application/json');

date_default_timezone_set("Asia/Kolkata");


define("DB_SERVER", "localhost");
define("DB_USER", "root");
define("DB_PASS", "entrO@2016");
/*
define("DB_SERVER", "localhost");
define("DB_USER", "root");
define("DB_PASS", "");
*/

define("DB_NAME", "ewaste");

//define("DIR_PATH", "http://".$_SERVER['HTTP_HOST'].':8080/covid19_app/files/');
define("DIR_PATH", "http://".$_SERVER['HTTP_HOST'].'/ewaste/files/');


try {
    $connection = new PDO("mysql:host=" . DB_SERVER . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
    $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

//    echo "Connected successfully";
}
catch (PDOException $e)
{
    echo "Connection failed: " . $e->getMessage();
}
//credentials for sms gateway
$username = 'APPCB';
$password = 'appcb@123456';
$senderid = 'PCBEMS';
$deptSecureKey = 'bf91fb66-09c1-4f2a-bbd6-9b3aef9096f9';

function get_name($table,$column,$id,$what)
{
    global $connection;

    $query="SELECT ".$what." FROM `".$table."` WHERE `".$column."` = '".$id."'";

    $selection = $connection->query($query);

    $data = $selection->fetch( PDO::FETCH_ASSOC );

    return $data[$what];

}
function moneyFormat($num){
    $explrestunits = "" ;
    $num=preg_replace('/,+/', '', $num);
    $words = explode(".", $num);
    $des="";
    if(count($words)<=2){
      $num=$words[0];
      if(count($words)>=2){$des=$words[1];}
      if(strlen($des)<2){$des="des0";}else{$des=substr($des,0,2);}
    }
    if(strlen($num)>3){
      $lastthree = substr($num, strlen($num)-3, strlen($num));
      $restunits = substr($num, 0, strlen($num)-3); // extracts the last three digits
      $restunits = (strlen($restunits)%2 == 1)?"0".$restunits:$restunits; // explodes the remaining digits in 2's formats, adds a zero in the beginning to maintain the 2's grouping.
      $expunit = str_split($restunits, 2);
      for($i=0; $i<sizeof($expunit); $i++){
        // creates each of the 2's group and adds a comma to the end
        if($i==0)
        {
          $explrestunits .= (int)$expunit[$i].","; // if is first value , convert into integer
        }else{
          $explrestunits .= $expunit[$i].",";
        }
      }
      $thecash = $explrestunits.$lastthree;
    } else {
      $thecash = $num;
    }
    return "$thecash"; // writes the final format where $currency is the currency symbol.
}
//$result = sendSingleSMS('APPCB',sha1(trim($password)),'PCBEMS','Your OTP is ','7288877893','bf91fb66-09c1-4f2a-bbd6-9b3aef9096f9');
//echo $result;
function generateRandID(){
    return md5(generateRandStr(16));
}
function generateRandStr($length){
    $randstr = "";
    for($i=0; $i<$length; $i++){
        $randnum = mt_rand(0,61);
        if($randnum < 10){
            $randstr .= chr($randnum+48);
        }else if($randnum < 36){
            $randstr .= chr($randnum+55);
        }else{
            $randstr .= chr($randnum+61);
        }
    }
    return $randstr;
}
function sendSingleSMS($username,$encryp_password,$senderid,$message,$mobileno,$deptSecureKey){
    $otp =  rand(1111,9999);
    $_SESSION['otp'] = $otp ;
    $message .= $otp;
    $key=hash('sha512',trim($username).trim($senderid).trim($message).trim($deptSecureKey));
    $data = array(
        "username" => trim($username), "password" => trim($encryp_password), "senderid" => trim($senderid), "content" => trim($message), "smsservicetype" =>"singlemsg", "mobileno" =>trim($mobileno),
        "key" => trim($key)
    );
    return post_to_url("https://msdgweb.mgov.gov.in/esms/sendsmsrequest",$data);
//calling post_to_url to send sms
}

function post_to_url($url, $data) {
    $fields = '';
    foreach($data as $key => $value) {
        $fields .= $key . '=' . $value . '&';
    }
    rtrim($fields, '&');
    $post = curl_init();
    curl_setopt($post,CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($post, CURLOPT_URL, $url); curl_setopt($post, CURLOPT_POST, count($data)); curl_setopt($post, CURLOPT_POSTFIELDS, $fields); curl_setopt($post, CURLOPT_RETURNTRANSFER, 1);
    $result = curl_exec($post); //output from server displayed curl_close($post);
    return $result;
}

$jsonData['result'] = '';
$jsonData['msg'] = '';
//$jsonData['data']=array();
$headers = getallheaders();

if (isset($_REQUEST['uploadFile'])) {
    $jsonData['uploadFile'] = true;
    $jsonData['filename'] = $_REQUEST['filename'];
    $jsonData['filepath'] = DIR_PATH . $_REQUEST['filename'];

    $jsonData['result'] = 'failed';

    if (move_uploaded_file($_FILES["image"]["tmp_name"], "./../files/". $_REQUEST['filename'])) {
        $jsonData['result'] = 'success';
        $jsonData['msg'] = 'Image Uploaded Succesfully';
    }
}else{
    if(isset($headers['apikey']) && $headers['apikey']==md5("EWASTE@2020")) {
        //----------------------------------Seller Services--------------------------------------//
        $a = file_get_contents("php://input");
        $_REQUEST = json_decode($a, true);
        if (isset($_REQUEST['type'])) {
            if ($_REQUEST['type'] == 'seller') {
                $jsonData['type'] = 'seller';
                if (isset($_REQUEST['sendOtp'])) {
                    $jsonData['sendOtp'] = true;
                    if (isset($_REQUEST['username'])) {
                        $result = sendSingleSMS($username, sha1(trim($password)), $senderid, 'Your OTP is ', $_REQUEST['username'], 'bf91fb66-09c1-4f2a-bbd6-9b3aef9096f9');
                        if (strpos($result, '402') == 0) {
                            $jsonData['result'] = 'success';
                            $jsonData['username'] = $_REQUEST['username'];
                            $jsonData['otp'] = $_SESSION['otp'];
                            $jsonData['msg'] = 'OTP Sent Successfully';
                        }else{
                            $jsonData['result'] = 'failed';
                        }
                    }else {
                        $jsonData['result'] = 'failed';
                        $jsonData['msg'] = 'Username Not Sent';
                    }
                }

                if (isset($_REQUEST['login'])) {
                    $jsonData['login'] = true;
                    if (isset($_REQUEST['username']) && isset($_REQUEST['password'])) {
                        $checklog = $connection->prepare("SELECT username,UID,profile_updated,userlevel FROM users WHERE username=:username and password=:password");
                        $checklog->execute(array('username' => $_REQUEST['username'],
                            'password' => md5($_REQUEST['password'])
                        ));
                        if ($checklog->rowCount() > 0) {
                            $checklogin = $checklog->fetch(PDO::FETCH_ASSOC);
                            //userlevel 1 for seller 2 for buyyer
                            $jsonData['userlevel'] = $checklogin['userlevel'];
                            $jsonData['username'] = $_REQUEST['username'];
                            $jsonData['uid'] = $checklogin['UID'];
                            $jsonData['profile_updated'] = $checklogin['profile_updated'];
                            $jsonData['result'] = 'success';
                        } else {
                            $jsonData['result'] = 'failed';
                            $jsonData['msg'] = 'Username not found';
                        }
                    } else {
                        $jsonData['result'] = 'failed';
                        $jsonData['msg'] = 'Username Not Sent';
                    }
                }

                if (isset($_REQUEST['register'])) {
                    $jsonData['register'] = true;
                    if (isset($_REQUEST['otp'])) {                       
                        $checkUser = $connection->prepare("SELECT username FROM users WHERE username=:username");
                        $checkUser->execute(array(
                            'username' => $_REQUEST['username'],
                        ));
                        if ($checkUser->rowCount() == 0) {
                            $reg = $connection->prepare("INSERT users set username=:username,password=:password,userid=:userid,userlevel=:userlevel,mobile=:mobile,timestamp=:timestamp,valid=:valid,name=:name,UID=:uid,hash=:hash,hash_generated=:hash_generated,district=:district,mandal=:mandal,pincode=:pincode,landmark=:landmark,address=:address");
                            $sel = $connection->prepare("SELECT COUNT(*) as cnt from users where userlevel=1");
                            $sel->execute();
                            $sele = $sel->fetch(PDO::FETCH_ASSOC);
                            $uid = "SEL" . ($sele['cnt'] + 1) . strrev(substr($_REQUEST['username'], 5));
                            $reg->execute(array(
                                'username' => $_REQUEST['username'],
                                'password' => md5($_REQUEST['password']),
                                'userid' => generateRandID(),
                                //userlevel 1 for seller,2 for buyyer
                                'userlevel' => 1,
                                'mobile' => $_REQUEST['username'],
                                'timestamp' => time(),
                                'valid' => 1,
                                'name' => $_REQUEST['name'],
                                'uid' => $uid,
                                'hash' => 0,
                                'hash_generated' => 0,
                                'district' => $_REQUEST['district'],  
                                'mandal' => $_REQUEST['mandal'], 
                                'address' => trim(addslashes($_REQUEST['address'])),   
                                'pincode' => $_REQUEST['pincode'], 
                                'landmark' => $_REQUEST['landmark'],   
                                'latitude' => $_REQUEST['latitude'], 
                                'longitude' => $_REQUEST['longitude']                         
                            ));
                            if ($reg) {
                                $jsonData['result'] = 'success';
                                //send username,mobile for login screen auto population after registration
                                $jsonData['username'] = $_REQUEST['username'];
                                $jsonData['mobile'] = $_REQUEST['username'];
                            } else {
                                $jsonData['result'] = 'failed';
                                $jsonData['msg'] = $connection->errorInfo();
                            }
                        } else {
                            $jsonData['result'] = 'failed';
                            $jsonData['msg'] = "User already exists";
                        }                        
                    } //if empty otp sent
                    else {
                        $jsonData['result'] = 'failed';
                        $jsonData['msg'] = 'OTP not sent';
                    }
                }

                if (isset($_REQUEST['forgotPassword'])) {
                    if (isset($_REQUEST['otp'])) {
                        if ($_REQUEST['otp'] == $_SESSION['otp']) {
                            if (isset($_REQUEST['username'])) {
                                if ($_REQUEST['password'] === $_REQUEST['confirmpassword']) {
                                    $stmt = $connection->prepare("SELECT username FROM users where username=:username");
                                    $stmt->execute(array("username" => $_REQUEST['username']));
                                    if ($stmt->rowCount() > 0) {
                                        $update_pass = $connection->prepare("UPDATE users SET password=:password WHERE username=:username");
                                        $update_pass->execute(array(
                                            'username' => $_REQUEST['username'],
                                            'password' => md5($_REQUEST['password']),
                                        ));
                                    } else {
                                        $jsonData['result'] = 'failed';
                                        $jsonData['error'] = 'Invalid username';
                                    }
                                } else {
                                    $jsonData['result'] = 'failed';
                                    $jsonData['msg'] = 'Passwords do not match';
                                }
                            } else {
                                $jsonData['result'] = 'failed';
                                $jsonData['msg'] = 'Username not sent';
                            }
                        } else {
                            $jsonData['result'] = 'failed';
                            $jsonData['msg'] = 'Invalid OTP';
                        }
                    } else {
                        $jsonData['result'] = 'failed';
                        $jsonData['msg'] = 'OTP not sent';
                    }
                }

                if (isset($_REQUEST['updateProfile'])) {
                    if (isset($_REQUEST['uid'])) {
                        if (isset($_REQUEST['firstname']) && isset($_REQUEST['lastname']) && isset($_REQUEST['user_type']) && isset($_REQUEST['address_1']) && isset($_REQUEST['address_2']) && isset($_REQUEST['area']) && isset($_REQUEST['mobile']) && isset($_REQUEST['city']) && isset($_REQUEST['state']) && isset($_REQUEST['country'])) {
                            $veri = $connection->prepare("SELECT * FROM users where uid=:uid");
                            $veri->execute(array("uid" => $_REQUEST['uid']));
                            if ($veri->rowCount() > 0) {
                                $jsonData['result'] = 'success';
                                $profile_insert = $connection->prepare("INSERT INTO profile values (NULL,:uid,:firstname,:lastname,:email,:mobile,:usertype,:timestamp) ON DUPLICATE KEY UPDATE firstname=:firstname,lastname=:lastname,:email=:email,mobile=:mobile,usertype=:usertype,timestamp:timestamp");
                                $profile_insert->execute(array(
                                    'uid' => $_REQUEST['uid'],
                                    'firstname' => $_REQUEST['firstname'],
                                    'lastname' => $_REQUEST['lastname'],
                                    'email' => $_REQUEST['email'],
                                    'mobile' => $_REQUEST['mobile'],
                                    'usertype' => $_REQUEST['usertype'],
                                    'timestamp' => $_REQUEST['timestamp']
                                ));
                                if ($profile_insert) {
                                    //insert into address table
                                    $ad_insert = $connection->prepare("INSERT INTO seller_address VALUES (NULL,:uid,:address1,:address2,:area,:mobile,:city,:state,:country,:timestamp)  ON DUPLICATE KEY UPDATE address_line1=:address1,address_line2=:address2,area=:area,city=:city,state=:state,country=:country,timestamp =:timestamp");
                                    $ad_insert->execute(array(
                                        'uid' => $_REQUEST['uid'],
                                        'address1' => $_REQUEST['address_1'],
                                        'address2' => $_REQUEST['address_2'],
                                        'area' => $_REQUEST['area'],
                                        'city' => $_REQUEST['city'],
                                        'state' => $_REQUEST['state'],
                                        'country' => 'India',
                                        'timestamp' => time()
                                    ));
                                }
                                if ($profile_insert && $ad_insert) {
                                    $jsonData['result'] = 'success';
                                    $jsonData['msg'] = 'Profile Updated Succesfully';
                                }
                            } else {
                                $jsonData['result'] = 'failed';
                                $jsonData['msg'] = 'Invalid UserName';
                            }
                        } else {
                            $jsonData['result'] = 'failed';
                            $jsonData['msg'] = 'All Fileds not sent';
                        }
                    } else {
                        $jsonData['result'] = 'failed';
                        $jsonData['msg'] = 'UID not sent';
                    }
                }
                if (isset($_REQUEST['category'])) {
                    $jsonData['category'] = true;
                    $jsonData['itemCategory'] = array();
                    $getC = $connection->prepare("select id,category from category");
                    $getC->execute();
                    $i = 0;
                    while ($getCategory = $getC->fetch(PDO::FETCH_ASSOC)) {
                        $jsonData['itemCategory'][$i]['value'] = $getCategory['id'];
                        $jsonData['itemCategory'][$i]['label'] = $getCategory['category'];
                        $i++;
                    }
                    $jsonData['result'] = 'success';
                    $jsonData['msg'] = 'Category data fetched successfully!';
                    if($_REQUEST['username']){
                        $latitude = $_REQUEST['latitude'];
                        $longitude = $_REQUEST['longitude'];
                        //Get Distance 
                        $sql = $connection->prepare("SELECT * , (3956 * 2 * ASIN(SQRT( POWER(SIN(( $latitude - latitude) *  pi()/180 / 2), 2) +COS( $latitude * pi()/180) * COS(latitude * pi()/180) * POWER(SIN(( $longitude - longitude) * pi()/180 / 2), 2) ))) as distance from users WHERE username='".$_REQUEST['username']."' ");
                        $sql->execute();
                        $row=$sql->fetch();
                        $distance = round($row['distance']*1.60934,2)*1000;
                        if($distance <= 20){
                            $status = 0;
                            $jsonData['latitude'] = $row['latitude'];
                            $jsonData['longitude'] = $row['longitude'];
                        }else{
                            $status = 1;
                            $jsonData['latitude'] = $_REQUEST['latitude'];
                            $jsonData['longitude'] = $_REQUEST['longitude'];
                        }
                        $jsonData['address'] = $row['address'];
                        $jsonData['landmark'] = $row['landmark'];
                        $jsonData['distance'] = round($distance); 
                        $jsonData['status'] = $status; 
                        $jsonData['pincode'] = $row['pincode'];
                    }
                }
                if (isset($_REQUEST['conv'])) {
                    $jsonData['conv'] = true;
                    $jsonData['conv'] = array();
                    $getSub = $connection->prepare("select * from ticket_conversation where post=:post_id AND vendor=:vendor AND username=:username  ");
                    $getSub->execute(array('post_id' => $_REQUEST['post_id'],'vendor' => $_REQUEST['vendor'],'username' => $_REQUEST['username']));
                    $i = 0;
                    while ($getSubCategory = $getSub->fetch(PDO::FETCH_ASSOC)) {
                        $jsonData['conv'][$i]['message'] = $getSubCategory['message'];
                        $jsonData['conv'][$i]['timestamp'] =  date('l, d F y,h:i:s A',$getSubCategory['timestamp']);
                        $i++;
                    }
                    $jsonData['result'] = 'success';
                    $jsonData['msg'] = 'Sub-Category data fetched successfully!';
                }
                if (isset($_REQUEST['sendmessage'])) {
                    $jsonData['conv'] = true;
                    $getSub = $connection->exec("INSERT INTO ticket_conversation SET username='".$_REQUEST['username']."',message='".$_REQUEST['message']."',post='".$_REQUEST['post_id']."',vendor='".$_REQUEST['vendor']."',timestamp='".time()."',estatus='1' ");
                    $last_inserted_id = $connection->lastInsertId();
                    if($last_inserted_id){
                        $jsonData['result'] = 'success';
                        $jsonData['msg'] = 'Message delivered successfully';
                    }else{
                        $jsonData['result'] = 'success';
                        $jsonData['msg'] = 'Message delivery failed';

                    }
                }
                if (isset($_REQUEST['subcategory'])) {
                    $jsonData['subcategory'] = true;
                    $jsonData['subItemCategory'] = array();
                    $getSub = $connection->prepare("select * from sub_category where cid=:cid");
                    $getSub->execute(array('cid' => $_REQUEST['cid']));
                    $summary = get_name('category','id',$_REQUEST['cid'],'summary');
                    $jsonData['summary'] = $summary;
                    $i = 0;
                    while ($getSubCategory = $getSub->fetch(PDO::FETCH_ASSOC)) {
                        $jsonData['subItemCategory'][$i]['value'] = $getSubCategory['id'];
                        $jsonData['subItemCategory'][$i]['label'] = $getSubCategory['category'];
                        $i++;
                    }
                    $jsonData['result'] = 'success';
                    $jsonData['msg'] = 'Sub-Category data fetched successfully!';
                }
                if (isset($_REQUEST['postitem'])) {
                    if (isset($_REQUEST['cat']) && isset($_REQUEST['subcat']) && isset($_REQUEST['product_description']) && (isset($_REQUEST['quantity']) || isset($_REQUEST['weight']))) {
                        if (count($_REQUEST['images']) > 0) {
                            $uid = get_name('users','username',$_REQUEST['uid'],'UID');
                            //generate a post id
                            $sel = $connection->prepare("SELECT max(id) as cnt from posts");
                            $sel->execute();
                            $selec = $sel->fetch(PDO::FETCH_ASSOC);
                            $postid = "POS" . substr($_REQUEST['uid'], 3) . ($selec['cnt'] + 1);
                            //insert into post table
                            // $insPo = $connection->prepare("insert into posts values (NULL,:uid,:post_id,:category,:sub_category,:product_description,:quantity,:weight,:timestamp)");
                            $insPo = $connection->prepare("insert into posts set uid='".$uid."',post_id='".$postid."',category='".$_REQUEST['cat']."',subcategory='".$_REQUEST['subcat']."',product_description='".$_REQUEST['product_description']."',quantity='".$_REQUEST['quantity']."',weight='".$_REQUEST['weight']."',timestamp='".time()."',latitude='".$_REQUEST['latitude']."',longitude='".$_REQUEST['longitude']."',working_condition='".$_REQUEST['condition']."',date='".$_REQUEST['date']."',offer_price='".$_REQUEST['offer_price']."'");

                            $insPo->execute(array('uid' => $uid, 'post_id' => $postid, 'category' => $_REQUEST['cat'], 'subcategory' => $_REQUEST['subcat'], 'product_description' => $_REQUEST['product_description'], 'quantity' => $_REQUEST['quantity'], 'weight' => $_REQUEST['weight'], 'timestamp' => time()));
                            if ($insPo) {
                                //last inserted i
                                $last_inserted_id = $connection->lastInsertId();
                                //insert into post attachments
                                for ($i = 0; $i < count($_REQUEST['images']); $i++) {
                                    if($_REQUEST['images'][$i] != ''){
                                        $insAt = $connection->prepare("insert into post_attachments values (NULL,:post_id,:pid,:image,:timestamp)");
                                        $insAt->execute(array('post_id' => $postid, 'pid' => $last_inserted_id, 'image' => $_REQUEST['images'][$i], 'timestamp' => time()));
                                    }
                                }
                                //insert into post status
                                $insPs = $connection->prepare("insert into post_status values (NULL,:uid,:post_id,:pid,1,:timestamp) ON DUPLICATE key update uid=:uid,post_id=:post_id,pid=:pid,timestamp=:timestamp");
                                $insPs->execute(array('uid' => $uid, 'post_id' => $postid, 'pid' => $last_inserted_id, 'timestamp' => time()));
                            }
                            if ($insPo && $insAt && $insPs) {
                                $jsonData['result'] = 'success';
                                $jsonData['msg'] = 'Data Posted Succesfully';
                            } else {
                                $jsonData['result'] = 'failed';
                                $jsonData['msg'] = $connection->errorInfo();
                            }
                        } else {
                            $jsonData['result'] = 'failed';
                            $jsonData['msg'] = 'Please Select atleast one Image';
                        }
                    } else {
                        $jsonData['result'] = 'failed';
                        $jsonData['msg'] = 'All Parameters not sent';
                    }
                }
                if (isset($_REQUEST['myposts'])) {
                    $jsonData['myposts'] = true;
                    $jsonData['posts'] = array();
                    $user_id = get_name('users','username',$_REQUEST['uid'],'UID');
                    if($_REQUEST['cat'] != ''){
                        $category = "AND A.category='".$_REQUEST['cat']."'";
                    }else{
                        $category = "";
                    }
                    if($_REQUEST['subcat'] != ''){
                        $subcategory = "AND A.subcategory='".$_REQUEST['subcat']."'";
                    }else{
                        $subcategory = "";
                    }
                    if($_REQUEST['userlevel'] == '1'){
                        $uid = "AND A.uid='".$user_id."'";
                    }else{
                        $uid = "";
                    }
                    
                    $q1=$connection->prepare("select A.id,A.post_id,category,subcategory,quantity,weight,A.timestamp,A.offer_price from posts as A inner join post_status as B on A.post_id = B.post_id where B.status = 1 ".$category.$subcategory.$uid." GROUP BY A.post_id ");
                    $q1->execute();
                    $limit=5;
                    if(isset($_REQUEST['page']) && $_REQUEST['page']!=0)
                    {
                        $start = ($_REQUEST['page'] - 1) * $limit;
                        $page = $_REQUEST['page'];
                    }
                    else
                    {
                        $start = 0;
                        $page=0;
                    }
                    $num_rows = $q1->rowcount();
                    $page_limit = ceil($num_rows/$limit);
                    if($page<=$page_limit){
                        $getPo = $connection->prepare("select A.*,B.status from posts as A inner join post_status as B on A.post_id = B.post_id where  B.status = 1 ".$category.$subcategory.$uid." GROUP BY A.post_id ORDER BY A.timestamp DESC limit $start, $limit ");

                       $getPo->execute();
                        $i = 0;
                        $j = 0;
                        $amount = 0;
                        if ($getPo->rowCount() > 0) {
                            while ($getPosts = $getPo->fetch(PDO::FETCH_ASSOC)) {
                                $amount = $amount + $getPosts['offer_price'];
                                //Receiver'c count
                                $selrp=$connection->prepare("SELECT COUNT(*) FROM receivers_interested WHERE id!='' AND post_id='".$getPosts['post_id']."' AND uid='".$user_id."'");
                                $selrp->execute();
                                $rowcount=$selrp->fetch();
                                //End
                                if($_REQUEST['interested'] != "1"){
                                    if($rowcount[0] == 0){
                                        $sql=$connection->prepare("SELECT COUNT(*) FROM receivers_interested WHERE id!='' AND post_id='".$getPosts['post_id']."' GROUP BY buyyer_id ");
                                        $sql->execute();
                                        $row=$sql->fetch();
                                        if($row[0] != 0){                                    
                                            $jsonData['posts'][$i]['verified'] = 1;
                                            $jsonData['posts'][$i]['count'] = $row[0];
                                        }else{                                 
                                            $jsonData['posts'][$i]['verified'] = 0;
                                            $jsonData['posts'][$i]['count'] = 0;
                                            $j++;
                                        }
                                        
                                        $jsonData['posts'][$i]['pid'] = $getPosts['id'];
                                        $jsonData['posts'][$i]['post_id'] = $getPosts['post_id'];
                                        $jsonData['posts'][$i]['product_description'] = $getPosts['product_description'];
                                        $jsonData['posts'][$i]['category'] = get_name('category','id',$getPosts['category'],'category');
                                        $jsonData['posts'][$i]['subcategory'] = get_name('sub_category','id',$getPosts['subcategory'],'category');
                                        $jsonData['posts'][$i]['mobile'] = get_name('users','UID',$getPosts['uid'],'mobile');
                                        $jsonData['posts'][$i]['quantity'] = $getPosts['quantity'];
                                        $jsonData['posts'][$i]['weight'] = $getPosts['weight'];
                                        $jsonData['posts'][$i]['uid'] = $getPosts['uid'];
                                        //status 0-closed,1-open,2-cancelled
                                        if($getPosts['status'] == 0){
                                            $jsonData['posts'][$i]['post_status'] = "Closed";
                                        }
                                        else if($getPosts['status'] == 1){
                                            $jsonData['posts'][$i]['post_status'] = "Pending";
                                        }
                                        else if($getPosts['status'] == 2){
                                            $jsonData['posts'][$i]['post_status'] = "Cancelled";
                                        }
                                            $jsonData['posts'][$i]['status'] = $getPosts['status'];
                                        $jsonData['posts'][$i]['latitude'] = $getPosts['latitude'];
                                        $jsonData['posts'][$i]['longitude'] = $getPosts['longitude'];
                                        $jsonData['posts'][$i]['condition'] = $getPosts['working_condition'];
                                        $jsonData['posts'][$i]['offer_price'] = $getPosts['offer_price'];
                                        $jsonData['posts'][$i]['date'] = $getPosts['date'];
                                        $jsonData['posts'][$i]['timestamp'] = Date('d-m-Y H:i:s', $getPosts['timestamp']);
                                        $i++;
                                    }
                                }
                                if($_REQUEST['interested'] == "1"){
                                    if($rowcount[0] > 0){
                                        $sql=$connection->prepare("SELECT COUNT(*) FROM receivers_interested WHERE id!='' AND post_id='".$getPosts['post_id']."' GROUP BY buyyer_id ");
                                        $sql->execute();
                                        $row=$sql->fetch();
                                        if($row[0] != 0){                                    
                                            $jsonData['posts'][$i]['verified'] = 1;
                                            $jsonData['posts'][$i]['count'] = $row[0];
                                        }else{                                 
                                            $jsonData['posts'][$i]['verified'] = 0;
                                            $jsonData['posts'][$i]['count'] = 0;
                                            $j++;
                                        }
                                        $jsonData['posts'][$i]['pid'] = $getPosts['id'];
                                        $jsonData['posts'][$i]['post_id'] = $getPosts['post_id'];
                                        $jsonData['posts'][$i]['product_description'] = $getPosts['product_description'];
                                        $jsonData['posts'][$i]['category'] = get_name('category','id',$getPosts['category'],'category');
                                        $jsonData['posts'][$i]['subcategory'] = get_name('sub_category','id',$getPosts['subcategory'],'category');
                                        $jsonData['posts'][$i]['mobile'] = get_name('users','UID',$getPosts['uid'],'mobile');
                                        $jsonData['posts'][$i]['quantity'] = $getPosts['quantity'];
                                        $jsonData['posts'][$i]['weight'] = $getPosts['weight'];
                                        $jsonData['posts'][$i]['uid'] = $getPosts['uid'];
                                        //status 0-closed,1-open,2-cancelled
                                        if($getPosts['status'] == 0){
                                            $jsonData['posts'][$i]['post_status'] = "Closed";
                                        }
                                        else if($getPosts['status'] == 1){
                                            $jsonData['posts'][$i]['post_status'] = "Pending";
                                        }
                                        else if($getPosts['status'] == 2){
                                            $jsonData['posts'][$i]['post_status'] = "Cancelled";
                                        }
                                            $jsonData['posts'][$i]['status'] = $getPosts['status'];
                                        $jsonData['posts'][$i]['latitude'] = $getPosts['latitude'];
                                        $jsonData['posts'][$i]['longitude'] = $getPosts['longitude'];
                                        $jsonData['posts'][$i]['condition'] = $getPosts['working_condition'];
                                        $jsonData['posts'][$i]['offer_price'] = $getPosts['offer_price'];
                                        $jsonData['posts'][$i]['date'] = $getPosts['date'];
                                        $jsonData['posts'][$i]['timestamp'] = Date('d-m-Y H:i:s', $getPosts['timestamp']);
                                        $i++;
                                    }
                                }
                            }
                            $jsonData['amount'] = $amount;
                            $jsonData['result'] = 'success';
                            $jsonData['msg'] = 'Posts Fetched Successfully';
                        } else {
                            $jsonData['result'] = 'failed';
                            $jsonData['msg'] = 'No Posts Found';
                        }
                    }else{
                        $jsonData['result']= 'failed';
                        $jsonData['msg'] = 'Out of Data';
                    }
                }
                if (isset($_REQUEST['postview'])) {
                    $jsonData['postview'] = true;
                    $jsonData['posts'] = array();
                    $username =get_name('users','username',$_REQUEST['username'],'UID');
                    $getPo = $connection->prepare("select * from posts as A inner join post_status as B on A.post_id = B.post_id where A.uid=:uid and B.status = 1 and A.post_id=:post_id");
                    $getPo->execute(array('uid' => get_name('users','username',$_REQUEST['uid'],'UID'), 'post_id' => $_REQUEST['post_id']));
                    $i = 0;
                    if ($getPo->rowCount() > 0) {
                        $sql=$connection->prepare("SELECT COUNT(*) FROM receivers_interested WHERE id!='' AND post_id='".$_REQUEST['post_id']."' AND uid='".$username."' ");
                        $sql->execute();
                        $row=$sql->fetch();
                        if($row[0] != 0){                                    
                            $jsonData['verified'] = 1;
                        }else{                                 
                            $jsonData['verified'] = 0;
                        }
                        while ($getPosts = $getPo->fetch(PDO::FETCH_ASSOC)) {
                            $j = 0;
                           
                            //fetch attachments from post_attachments table
                            $getAtt = $connection->prepare("select name from post_attachments where pid=:pid");
                            $getAtt->execute(array('pid' => $getPosts['pid']));
                            while ($getAttachments = $getAtt->fetch(PDO::FETCH_ASSOC)) {
                                $jsonData['posts'][$j]['path'] =$getAttachments['name'];
                                $j++;
                            }                            
                        }
                        $jsonData['result'] = 'success';
                        $jsonData['msg'] = 'Posts Fetched Successfully';
                    } else {
                        $jsonData['result'] = 'failed';
                        $jsonData['msg'] = 'No Posts Found';
                    }
                }
                if (isset($_REQUEST['cancelpost'])) {
                    $jsonData['cancelpost'] = true;
                    if (isset($_REQUEST['postid'])) {
                        if(isset($_REQUEST['post_status']))
                        {
                            if($_REQUEST['post_status'] === 1) {
                                $canPo = $connection->prepare("update post_status set status = 2 where post_id='" . $_REQUEST['postid'] . "'");
                                $canPo->execute();
                                if ($canPo) {
                                    $jsonData['result'] = 'success';
                                    $jsonData['msg'] = 'Post Succesfully cancelled';
                                } else {
                                    $jsonData['result'] = 'failed';
                                    $jsonData['msg'] = $connection->errorInfo();
                                }
                            }
                            else {
                                $jsonData['result'] = 'failed';
                                $jsonData['msg'] = 'This Post cannot be cancelled';
                            }
                        }
                        else{
                            $jsonData['result'] = 'failed';
                            $jsonData['msg'] = 'Post Current Status not sent';
                        }
                    } else {
                        $jsonData['result'] = 'failed';
                        $jsonData['msg'] = 'Missing PID or Post id';
                    }
                }
                if (isset($_REQUEST['closepost'])) {
                    $jsonData['cancelpost'] = true;
                    if (isset($_REQUEST['postid'])) {
                        if(isset($_REQUEST['post_status']))
                        {
                            if($_REQUEST['post_status'] != 0) {
                                $canPo = $connection->prepare("update post_status set status = 0  where post_id='" . $_REQUEST['postid'] . "'");
                                $canPo->execute();
                                if ($canPo) {
                                    $jsonData['result'] = 'success';
                                    $jsonData['msg'] = 'Post Succesfully Closed';
                                } else {
                                    $jsonData['result'] = 'failed';
                                    $jsonData['msg'] = $connection->errorInfo();
                                }
                            }
                            else {
                                $jsonData['result'] = 'failed';
                                $jsonData['msg'] = 'This Post is already closed';
                            }
                        }
                        else{
                            $jsonData['result'] = 'failed';
                            $jsonData['msg'] = 'Post Current Status not sent';
                        }
                    } else {
                        $jsonData['result'] = 'failed';
                        $jsonData['msg'] = 'Missing PID or Post id';
                    }
                }
                if (isset($_REQUEST['sellerHistory'])) {
                    $jsonData['sellerHistory'] = true;
                    $jsonData['posthistory'] = array();
                    $getHis = $connection->prepare("select * from posts where uid=:uid");
                    $getHis->execute(array('uid' => $_REQUEST['uid']));
                    $i = 0;
                    if ($getHis->rowCount() > 0) {
                        while ($getHistory = $getHis->fetch(PDO::FETCH_ASSOC)) {
                            $jsonData['posthistory'][$i]['pid'] = $getHistory['id'];
                            $jsonData['posthistory'][$i]['post_id'] = $getHistory['post_id'];
                            $jsonData['posthistory'][$i]['category'] = $getHistory['category'];
                            $jsonData['posthistory'][$i]['subcategory'] = $getHistory['subcategory'];
                            $jsonData['posthistory'][$i]['quantity'] = $getHistory['quantity'];
                            $jsonData['posthistory'][$i]['weight'] = $getHistory['weight'];
                            $jsonData['posthistory'][$i]['timestamp'] = Date('d-m-Y H:i:s', $getHistory['timestamp']);
                            $i++;
                        }
                        $jsonData['result'] = 'success';
                        $jsonData['msg'] = 'Posts Fetched Successfully';
                    } else {
                        $jsonData['result'] = 'failed';
                        $jsonData['msg'] = 'No Posts Found';
                    }
                }
                if(isset($_REQUEST['showReceiversInterested']))
                {
                    $jsonData['showReceiversInterested'] = true;
                    $jsonData['posthistory'] = array();
                    if(isset($_REQUEST['uid']))
                    {
                        $uid = get_name('users','username',$_REQUEST['uid'],'UID');
                        $post_id = $_REQUEST['post_id'];
                        $showReIn = $connection->prepare("select * from receivers_interested where uid=:uid,post_id=:post_id");
                        $showReIn->execute(array('uid'=>$uid,'post_id'=>$post_id));
                        $i = 0;
                        if($showReIn->rowCount() > 0) {
                            while ($showReInterested = $showReIn->fetch(PDO::FETCH_ASSOC)) {
                                $jsonData['posthistory'][$i]['pid'] = $showReInterested['id'];
                                $jsonData['posthistory'][$i]['post_id'] = $showReInterested['post_id'];
                                $jsonData['posthistory'][$i]['category'] = get_name('posts', 'post_id', $showReInterested['post_id'], 'category');
                                $jsonData['posthistory'][$i]['subcategory'] = get_name('posts', 'post_id', $showReInterested['post_id'], 'subcategory');
                                $jsonData['posthistory'][$i]['quantity'] = get_name('posts', 'post_id', $showReInterested['post_id'], 'quantity');
                                $jsonData['posthistory'][$i]['weight'] = get_name('posts', 'post_id', $showReInterested['post_id'], 'weight');
                                $jsonData['posthistory'][$i]['buyyer_id'] = $showReInterested['buyyer_id'];
                                $jsonData['posthistory'][$i]['timestamp'] = Date('d-m-Y H:i:s', $showReInterested['timestamp']);
                                $i++;
                            }
                            $jsonData['result'] = 'success';
                            $jsonData['msg'] = 'Data fetched Successfully';
                        }else {
                            $jsonData['result'] = 'failed';
                            $jsonData['msg'] = 'No results found';
                        }
                    }
                    else {
                        $jsonData['result'] = 'failed';
                        $jsonData['msg'] = 'UID not sent';
                    }
                }
                if(isset($_REQUEST['buyyerCount']))
                {
                    $jsonData['buyyerCount'] = true;
                    if(isset($_REQUEST['uid']))
                    {
                        $getCo = $connection->prepare("select count(id) as cnt from receivers_interested where uid=:uid");
                        $getCo->execute(array('uid'=>$_REQUEST['uid']));
                        $getCount = $getCo->fetch(PDO::FETCH_ASSOC);
                        $jsonData['buyyerCount'] = $getCount['cnt'];
                        $jsonData['result'] = 'success';
                        $jsonData['msg'] = 'Data Fetched Successfully';
                    }
                    else {
                        $jsonData['result'] = 'failed';
                        $jsonData['msg'] = 'UID not sent';
                    }
                }
                if (isset($_REQUEST['recieversInterestedPostView'])) {
                    $jsonData['recieversInterestedPostView'] = true;
                    $jsonData['buyyers'] = array();
                    $uid = get_name('users','username',$_REQUEST['uid'],'UID');
                    $getPo = $connection->prepare("select A.* from receivers_interested as A inner join post_status as B on A.post_id = B.post_id where A.buyyer_id='".$uid."' and B.status = 1 and A.post_id='".$_REQUEST['post_id']."' GROUP BY A.uid");
                    $getPo->execute(array('uid' => $uid, 'post_id' => $_REQUEST['post_id']));
                    $i = 0;
                    if ($getPo->rowCount() > 0) {
                        while ($getPosts = $getPo->fetch(PDO::FETCH_ASSOC)) {
                            $jsonData['buyyers'][$i]['buyyer_id'] = $getPosts['uid'];
                            $jsonData['buyyers'][$i]['post_id'] = $_REQUEST['post_id'];
                            $jsonData['buyyers'][$i]['uid'] = $getPosts['uid'];
                            $jsonData['buyyers'][$i]['price'] = moneyFormat($getPosts['price']);
                            $jsonData['buyyers'][$i]['remarks'] = ucwords($getPosts['remarks']);
                            $jsonData['buyyers'][$i]['mobile'] = get_name('empanelled_vendors','uid',$getPosts['uid'],'mobile');
                            $jsonData['buyyers'][$i]['buyyer_name'] = get_name('empanelled_vendors','uid',$getPosts['uid'],'vendor_name');
                            $jsonData['buyyers'][$i]['buyyer_address'] = get_name('empanelled_vendors','uid',$getPosts['uid'],'vendor_address');
                            $i++;
                        }
                        $jsonData['result'] = 'success';
                        $jsonData['msg'] = 'buyyers details Fetched Successfully';
                    } else {
                        $jsonData['result'] = 'failed';
                        $jsonData['msg'] = 'No Posts Found';
                    }
                }
            }
            //----------------------------------Buyyer Services--------------------------------------//

            else {
                $jsonData['type'] = 'buyyer';
                //get vendors list in drop down
                if(isset($_REQUEST['getVendors']))
                {
                    $jsonData['getVendors'] = true;
                    $jsonData['sellerData'] = array();
                    $getVe = $connection->prepare("select * from empanelled_vendors");
                    $getVe ->execute();
                    $i = 0;
                    while($getVendors = $getVe->fetch(PDO::FETCH_ASSOC))
                    {
                        $jsonData['sellerData'][$i]['value'] = $getVendors['id'];
                        $jsonData['sellerData'][$i]['label'] = $getVendors['vendor_name'];
                        $jsonData['sellerData'][$i]['mobile'] = $getVendors['mobile'];
                        if($getVendors['latitude'] != null || $getVendors['latitude']!='')
                            $jsonData['sellerData'][$i]['latitude'] = $getVendors['latitude'];
                        else
                            $jsonData['sellerData'][$i]['latitude'] = '';
                        if($getVendors['longitude'] != null || $getVendors['longitude'] != '')
                            $jsonData['sellerData'][$i]['longitude'] = $getVendors['longitude'];
                        else
                            $jsonData['sellerData'][$i]['longitude'] = '';
                        $i++;
                    }

                    $jsonData['msg'] = "data fetched successfully";
                    $jsonData['result'] = 'success';
                }
                if(isset($_REQUEST['districts']))
                {
                    $jsonData['districts'] = true;
                    $jsonData['districtsData'] = array();
                    $getVe = $connection->prepare("select * from global_districts");
                    $getVe ->execute();
                    $i = 0;
                    while($getVendors = $getVe->fetch(PDO::FETCH_ASSOC))
                    {
                        $jsonData['districtsData'][$i]['value'] = $getVendors['uid'];
                        $jsonData['districtsData'][$i]['label'] = $getVendors['district'];
                        $i++;
                    }

                    $jsonData['msg'] = "data fetched successfully";
                    $jsonData['result'] = 'success';
                }
                if(isset($_REQUEST['mandals']))
                {
                    $jsonData['mandals'] = true;
                    $jsonData['mandalsData'] = array();
                    $getVe = $connection->prepare("select * from global_mandals where district='".$_REQUEST['district']."'");
                    $getVe ->execute();
                    $i = 0;
                    while($getVendors = $getVe->fetch(PDO::FETCH_ASSOC))
                    {
                        $jsonData['mandalsData'][$i]['value'] = $getVendors['uid'];
                        $jsonData['mandalsData'][$i]['label'] = $getVendors['mandal'];
                        $i++;
                    }

                    $jsonData['msg'] = "data fetched successfully";
                    $jsonData['result'] = 'success';
                }
                if(isset($_REQUEST['getMobile']))
                {
                    if(isset($_REQUEST['vendor_id'])) {
                        $jsonData['getMobile'] = true;
                        $getMo = $connection->prepare("select mobile from empanelled_vendors where id=:id");
                        $getMo->execute(array('id' => $_REQUEST['id']));
                        $i = 0;
                        $getMobile = $getMo->fetch(PDO::FETCH_ASSOC);
                        $jsonData['mobile'][$i] = $getMobile['mobile'];
                        $jsonData['mobile_masked'] = '********' . substr($getMobile['mobile'],  -3);
                        $jsonData['msg'] = "data fetched successfully";
                        $jsonData['result'] = 'success';
                    }
                    else {
                        $jsonData['msg'] = "Vendor Id not sent";
                        $jsonData['result'] = 'failed';
                    }
                }


               
                if(isset($_REQUEST['buyyerRegister']))
                {
                    
                    if(isset($_REQUEST['username']))
                    //mobile number is the username
                    {
                        $buyyerRe = $connection->prepare("INSERT users set username=:username,password=:password,userid=:userid,userlevel=:userlevel,mobile=:mobile,timestamp=:timestamp,valid=:valid,name=:name,UID=:uid,profile_updated=:profile_updated,hash=:hash,hash_generated=:hash_generated");
                        //generate uid for buyyer

                        $buy = $connection->prepare("SELECT COUNT(*) as cnt from users where userlevel=2");
                        $buy->execute();
                        $buyy = $buy->fetch(PDO::FETCH_ASSOC);
                        $uid = "BYR" . ($buyy['cnt'] + 1) . strrev(substr($_REQUEST['username'], 5));

                        $buyyerRe->execute(array(
                            'username' => $_REQUEST['username'],
                            'password' => md5($_REQUEST['password']),
                            'userid' => generateRandID(),
                            //userlevel 1 for seller,2 for buyyer
                            'userlevel' => 2,
                            'mobile' => $_REQUEST['username'],
                            'timestamp' => time(),
                            'valid' => 1,
                            'name' => $_REQUEST['name'],
                            'uid' => $uid,
                            'profile_updated'=>1,
                            'hash' => 0,
                            'hash_generated' => 0,
                            'latitude' => $_REQUEST['latitude'],
                            'longitude' => $_REQUEST['longitude']
                        ));

                        //uid is generated,update the uid in the empanelled vendors table.

                        $upd = $connection->prepare("update empanelled_vendors set uid=:uid where mobile=:username");
                        $upd ->execute(array('uid'=>$uid,'username'=>$_REQUEST['username']));
                        if($buyyerRe && $upd) {
                            $jsonData['uid'] = $uid;
                            $jsonData['result'] = 'success';
                            $jsonData['msg'] = 'user registration successful';
                        }
                    }
                    else {
                        $jsonData['result'] = 'failed';
                        $jsonData['msg'] = 'Username not sent';
                    }
                }

              
                if(isset($_REQUEST['viewProfile']))
                {
                    $jsonData['viewProfile'] = true;
                    if(isset($_REQUEST['uid']))
                    //uid of buyyer
                    {
                        $sel_det = $connection->prepare("select * from empanelled_vendors where uid=:uid");
                        $sel_det ->execute(array('uid'=>$_REQUEST['uid']));
                        if($sel_det ->rowCount() > 0)
                        {
                            $sel_details = $sel_det->fetch(PDO::FETCH_ASSOC);
                            $jsonData['vendor_name'] = $sel_details['vendor_name'];
                            $jsonData['vendor_address'] = $sel_details['vendor_address'];
                            $jsonData['vendor_authno'] = $sel_details['vendor_authno'];
                            $jsonData['date'] = $sel_details['date'];
                            $jsonData['collection_center_name'] = $sel_details['collection_center_name'];
                            $jsonData['collection_center_address'] = $sel_details['collection_center_address'];
                            $jsonData['inspection_remarks_by_pcb'] = $sel_details['inspection_remarks_by_pcb'];
                            $jsonData['operational_status'] = $sel_details['operational_status'];
                            $jsonData['mobile'] = $sel_details['mobile'];
                            $jsonData['result'] = 'success';
                        }
                        else {
                            $jsonData['result'] = 'failed';
                            $jsonData['msg'] = 'Something went wrong! uid is not updated in vendors table';
                        }
                    }
                }
                if(isset($_REQUEST['userProfile']))
                {
                    $jsonData['userProfile'] = true;
                    if(isset($_REQUEST['uid']))
                    //uid of buyyer
                    {
                        $sel_det = $connection->prepare("select * from users where uid=:uid");
                        $sel_det ->execute(array('uid'=>$_REQUEST['uid']));
                        if($sel_det ->rowCount() > 0)
                        {
                            $sel_details = $sel_det->fetch(PDO::FETCH_ASSOC);
                            $jsonData['username'] = $sel_details['username'];
                            $jsonData['email'] = $sel_details['email'];
                            $jsonData['mobile'] = $sel_details['mobile'];
                            $jsonData['name'] = $sel_details['name'];
                            $jsonData['pincode'] = $sel_details['pincode'];
                            $jsonData['landmark'] = $sel_details['landmark'];
                            $jsonData['address'] = $sel_details['address'];
                            $jsonData['district'] = get_name('global_districts','uid', $sel_details['district'],'district');
                            $jsonData['mandal'] = get_name('global_mandals','uid', $sel_details['mandal'],'mandal');
                            $jsonData['result'] = 'success';
                        }
                        else {
                            $jsonData['result'] = 'failed';
                            $jsonData['msg'] = 'Something went wrong! uid is not updated in vendors table';
                        }
                    }
                }
                if (isset($_REQUEST['myposts'])) {
                    $jsonData['myposts'] = true;
                    $jsonData['posts'] = array();
                    $getPo = $connection->prepare("select A.id,A.post_id,category,subcategory,quantity,weight,A.uid,A.timestamp from posts as A inner join post_status as B on A.post_id = B.post_id where B.status = 1");
                    $getPo->execute();
                    $i = 0;
                    if ($getPo->rowCount() > 0) {
                        while ($getPosts = $getPo->fetch(PDO::FETCH_ASSOC)) {
                            $jsonData['posts'][$i]['pid'] = $getPosts['id'];
                            $jsonData['posts'][$i]['post_id'] = $getPosts['post_id'];
                            $jsonData['posts'][$i]['category'] = $getPosts['category'];
                            $jsonData['posts'][$i]['subcategory'] = $getPosts['subcategory'];
                            $jsonData['posts'][$i]['quantity'] = $getPosts['quantity'];
                            $jsonData['posts'][$i]['weight'] = $getPosts['weight'];
                            $jsonData['posts'][$i]['uid'] = $getPosts['uid'];
                            //status 0-closed,1-open,2-cancelled
                            $jsonData['posts'][$i]['status'] = $getPosts['status'];
                            $jsonData['posts'][$i]['timestamp'] = Date('d-m-Y H:i:s', $getPosts['timestamp']);
                            $i++;
                        }
                        $jsonData['result'] = 'success';
                        $jsonData['msg'] = 'Posts Fetched Successfully';
                    } else {
                        $jsonData['result'] = 'failed';
                        $jsonData['msg'] = 'No Posts Found';
                    }
                }
                if(isset($_REQUEST['buyyerInterested']))
                {
                    $jsonData['buyyerInterested'] = true;
                    //every receiver have a unique id
                    if(isset($_REQUEST['uid'])) {
                        if (isset($_REQUEST['price']) && isset($_REQUEST['remarks'])) {
                            //insert into receivers interested table
                            // $recIn = $connection->prepare("insert into receivers_interested values (NULL,:pid,:post_id,:uid,:buyyer_id,:price,:remarks,:timestamp)");
                            $uid=get_name('users','username',$_REQUEST['uid'],'UID');
                            $recIn = $connection->prepare("insert into receivers_interested set post_id='".$_REQUEST['post_id']."',uid='".$uid."',buyyer_id='".$_REQUEST['buyyer_id']."',price='".$_REQUEST['price']."',remarks='".$_REQUEST['remarks']."',timestamp='".time()."' ");

                            $recIn->execute(array('pid'=>$_REQUEST['pid'],'post_id'=>$_REQUEST['post_id'],'uid'=>get_name('posts','post_id',$_REQUEST['post_id'],'uid'),'buyyer_id'=>$_REQUEST['buyyer_id'],'price'=>$_REQUEST['price'],'remarks'=>trim(addslashes($_REQUEST['remarks'])),'timestamp'=>time()));
                            if($recIn)
                            {
                                $jsonData['result'] = 'success';
                                $jsonData['msg'] = 'Data Inserted Successfully';
                            }
                            else {
                                $jsonData['result'] = 'failed';
                                $jsonData['msg'] = $connection->errorInfo();
                            }
                        } else {
                            $jsonData['result'] = 'failed';
                            $jsonData['msg'] = 'Price or Remarks not sent';
                        }
                    }
                    else{
                        $jsonData['result'] = 'failed';
                        $jsonData['msg'] = 'UID not sent';
                    }
                }
                if (isset($_REQUEST['buyyerHistory'])) {
                    $jsonData['buyyerHistory'] = true;
                    $jsonData['posthistory'] = array();
                    $getHis = $connection->prepare("select * from posts where uid=:uid");
                    $getHis->execute(array('uid' => $_REQUEST['uid']));
                    $i = 0;
                    if ($getHis->rowCount() > 0) {
                        while ($getHistory = $getHis->fetch(PDO::FETCH_ASSOC)) {
                            $jsonData['posthistory'][$i]['pid'] = $getHistory['id'];
                            $jsonData['posthistory'][$i]['post_id'] = $getHistory['post_id'];
                            $jsonData['posthistory'][$i]['category'] = $getHistory['category'];
                            $jsonData['posthistory'][$i]['subcategory'] = $getHistory['subcategory'];
                            $jsonData['posthistory'][$i]['quantity'] = $getHistory['quantity'];
                            $jsonData['posthistory'][$i]['weight'] = $getHistory['weight'];
                            $jsonData['posthistory'][$i]['timestamp'] = Date('d-m-Y H:i:s', $getHistory['timestamp']);
                            $i++;
                        }
                        $jsonData['result'] = 'success';
                        $jsonData['msg'] = 'Posts Fetched Successfully';
                    } else {
                        $jsonData['result'] = 'failed';
                        $jsonData['msg'] = 'No Posts Found';
                    }
                }
            }
        }
        else {
            $jsonData['result'] = 'failed';
            $jsonData['msg'] = 'Type not sent';
        }
    }
    else {
        $jsonData['result'] = 'failed';
        $jsonData['msg'] = 'Wrong Api key or Api key not sent';
    }
}
echo json_encode($jsonData);