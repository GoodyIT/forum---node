var config = {
	"secret": 'nodebb-secret',
	"base_url": "http://localhost",
	"port": 4567,
	"mailer": {
		host: 'localhost',
		port: '25',
		from: 'mailer@localhost.lan'
	},
	"redis": {
		port: "6379",
		host: "127.0.0.1",
		options: {
			
		}
	}
}

config.url = config.base_url + ':' + config.port + '/';

module.exports = config;