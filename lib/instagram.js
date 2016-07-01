var cp = require('child_process');

function simplifyNum(num){
    var multiplier = ['','k','m','b'];
    var i;
    var _num = num;
    for(i=0;_num>=1000;i++){
        _num = _num/1000;
    }
    return String(Math.floor(_num*10)/10) +multiplier[i];
}

function _getUserInfo(username, success,error ){
    cp.exec("curl 'https://www.instagram.com/" + username + "/' | grep 'window._sharedData'",
        function (stderr, stdout, stdin) {

            console.log('stdin: ' + stdin);
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);

            var str = stdout.replace('<script type="text/javascript">window._sharedData = ', '').replace(';</script>', '');
            var data = JSON.parse(str);
            console.log(data);
            var profile = data.entry_data.ProfilePage;

            if (typeof profile === 'undefined' || stderr) {
                error();
                console.log('error')
                return;
            }





            var user = profile[0].user;


            var userBiography = user.biography;
            var userFullName = user.full_name;
            var userVerified = user.is_verified;
            var userProfile = user.profile_pic_url;
            var userLink = user.external_url;
            var username = user.username;
            var is_private = user.is_private;
            var followed_by = user.followed_by.count;
            var follows = user.follows.count;
            var smeerscore = Math.floor(Math.cbrt(followed_by)*10);
            var mediaCount = user.media.count;

            var DEFAULTBLANK = '--';
            var data = {
                smeerscore: smeerscore,
                userName: username,
                userFullName: userFullName,
                userBiography: userBiography,
                userVerified: userVerified,
                userProfile: userProfile,
                userLink: userLink,
                is_private: is_private,
                followed_by: simplifyNum(followed_by),
                follows: simplifyNum(follows),
                numPosts: simplifyNum(mediaCount),
                estWorth: DEFAULTBLANK,
                postCost: DEFAULTBLANK,
                monthlyRev: DEFAULTBLANK,
                annualRev: DEFAULTBLANK,
                engagementRate: DEFAULTBLANK,
                avgLikePerPost: DEFAULTBLANK,
                dailyLikes: DEFAULTBLANK,
                weeklyLikes: DEFAULTBLANK,
                monthlyLike: DEFAULTBLANK,
                yearlyLike: DEFAULTBLANK

            };

            if (!is_private) {
                var usermedia = user.media.nodes; //private
                var numPostsSample = usermedia.length;
                var numLikes = 0;
                var days = 0;
                if (numPostsSample > 0) {
                    days = new Date(usermedia[0].date * 1000 - usermedia[numPostsSample - 1].date * 1000).getDate();
                    for (var i = 0; i < numPostsSample; i++) {
                        numLikes += usermedia[i].likes.count;
                    }

                    var dailyEngagement = (numLikes / days);
                    var avgLikePerPost = numLikes / numPostsSample;
                    var postCost = avgLikePerPost / 1000 * 5;//5 CPM
                    var annualRev = postCost * 52; //Weekly promotions
                    data.estWorth = '$'+simplifyNum(Math.floor(annualRev * .6 / .25 * 1.5));
                    data.postCost ='$'+simplifyNum(postCost);
                    data.monthlyRev = '$'+simplifyNum(Math.floor(annualRev / 12));
                    data.annualRev = '$'+simplifyNum(Math.floor(annualRev));
                    data.engagementRate = simplifyNum(Math.floor(avgLikePerPost) / followed_by * 100)+'%';
                    data.avgLikePerPost = simplifyNum(avgLikePerPost);
                    data.dailyLikes = simplifyNum(Math.floor(dailyEngagement));
                    data.weeklyLikes = simplifyNum(Math.floor(dailyEngagement * 7));
                    data.monthlyLike = simplifyNum(Math.floor(dailyEngagement * 30));
                    data.yearlyLike = simplifyNum(Math.floor(dailyEngagement * 365));
                }

            }

            success({data:data});
        });
}
module.exports = {
    getUserInfo: _getUserInfo
};