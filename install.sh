#!/bin/sh
set -e

######### ENV VARS #########
INSTALLATION_HELPER=https://github.com/gabriel-pinheiro/elba-balancer#installation
CMD_STR="\e[1;2m$\e[0m"

BIN_URL=https://cdn.codetunnel.net/elba/elba
BIN_URL_ARM=https://cdn.codetunnel.net/elba/elba-arm
BIN_PATH=/usr/local/bin/elba
CONFIG_URL=https://raw.githubusercontent.com/gabriel-pinheiro/elba-balancer/main/elba.toml
CONFIG_PATH=/etc/elba/elba.toml
SUDO=sudo

######### HELPER FUNCTIONS #########
# Logs error and exists
die() {
    echo "Error: $1" 1>&2
    exit 1
}

# Verify that a command is installed
verify_command() {
    if ! command -v $1 >/dev/null 2>&1; then
        die "$1 not found. $2"
    fi
}

######### VALIDATIONS #########
# Verify we're on linux
if [ "$(uname)" != "Linux" ]; then
    die "This script is only for Linux. Try other installation methods: $INSTALLATION_HELPER"
fi

# Verify dependencies
verify_command "curl" "Please install it and try again."
verify_command "systemctl" "Try other installations methods: $INSTALLATION_HELPER"

# Ignore sudo if we're root
if [ "$(id -u)" = "0" ]; then
    SUDO=""
fi

# User ARM binary if its not x86_64
if [ "$(uname -i)" != "x86_64" ]; then
    BIN_URL=$BIN_URL_ARM
fi

######### INSTALLATION #########
# Stopping if previously installed
$SUDO systemctl stop elba 2>/dev/null || true

# Downloading
echo "Downloading binary to $BIN_PATH ..."
$SUDO curl -s $BIN_URL -o $BIN_PATH
$SUDO chmod +x $BIN_PATH
echo "Downloading configuration to $CONFIG_PATH ..."
$SUDO mkdir -p $(dirname $CONFIG_PATH)
$SUDO curl -s $CONFIG_URL -o $CONFIG_PATH

# Creating systemd service
echo "Creating systemd service on /etc/systemd/system/elba.service ..."
$SUDO tee /etc/systemd/system/elba.service >/dev/null <<EOF
[Unit]
Description=Elba Balancer
After=network.target

[Service]
Type=simple
Environment=CONFIG_PATH=$CONFIG_PATH
ExecStart=$BIN_PATH
Restart=always
RestartSec=10


[Install]
WantedBy=multi-user.target
EOF

echo "Restarting systemd ..."
$SUDO systemctl daemon-reload
echo "Starting Elba and enabling it on boot ..."
$SUDO systemctl start elba
$SUDO systemctl enable elba

######### INSTRUCTIONS #########
SPACE_SUDO=" sudo"
if [ "$(id -u)" = "0" ]; then
    SPACE_SUDO=""
fi

printf "\n\nYayy, Elba is now installed!\n\n"

printf "Check its status with:\n"
printf "$CMD_STR$SPACE_SUDO systemctl status elba\n\n"

printf "Check its logs with:\n"
printf "$CMD_STR$SPACE_SUDO journalctl -u elba\n\n"

printf "Test it with:\n"
printf "$CMD_STR curl http://localhost:8080\n\n"

printf "And after editing its configuration on /etc/elba/elba.toml restart it with:\n"
printf "$CMD_STR$SPACE_SUDO systemctl restart elba\n\n\n"


printf "Enjoy!! :)\n"
