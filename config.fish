alias q='exit'
alias v='vim'
alias devchrome='open http://localhost:8080 -a "/Applications/Google Chrome.app" --args --disable-web-security --user-data-dir'

# docker
alias db='docker build'
alias dc='docker container'
alias de='docker exec'
alias di='docker image'
alias dr='docker run'
alias ds='docker stop'
alias drc='docker rm'
alias dri='docker rmi'
alias dpl='docker pull'
alias dp='docker ps'
alias dcu='docker-compose up'
alias dcd='docker-compose down'

# elm
alias es='elm init'
alias ei='elm install'
alias eb='elm bump'
alias em='elm make'
alias er='elm reactor'

# git
alias gl='git log --oneline'
alias ga='git add'
alias gb='git branch'
alias gc='git commit'
alias gd='git diff'
alias gm='git merge'
alias gs='git status'
alias gcl='git clone'
alias gco='git checkout'
alias gdc='git diff --cached'
alias grb='git rebase'
alias grs='git reset'
alias gst='git stash'
alias gpl='git pull'
alias gps='git push'

# stack haskell
alias hs='stack runghc'
alias hsb='stack build'
alias hsc='stack runhaskell'
alias ghci='stack ghci'
alias hp2ps='stack exec -- hp2ps -c'

# yarn
alias ya='yarn add'
alias yb='yarn build'
alias yd='yarn dev'
alias yg='yarn global'
alias yga='yarn global add'
alias ygr='yarn global remove'
alias ygu='yarn global upgrade'
alias yi='yarn install'
alias yl='yarn lint'
alias yr='yarn remove'
alias ys='yarn serve'
alias yt='yarn test'
alias yw='yarn watch'

# export PATH="$HOME/.cargo/bin:$PATH"
# export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"
set PATH $HOME/.cargo/bin $HOME/.yarn/bin $HOME/.config/yarn/global/node_modules/.bin $PATH

starship init fish | source
eval (nodenv init - | source)
eval (rbenv init - | source)