alias q='exit'
alias v='vim'
alias devchrome='open http://localhost:8080 -a "/Applications/Google Chrome.app" --args --disable-web-security --user-data-dir'

# docker
alias db='docker build $args'
alias dc='docker container $args'
alias de='docker exec $args'
alias di='docker image $args'
alias dr='docker run $args'
alias ds='docker stop $args'
alias drc='docker rm $args'
alias dri='docker rmi $args'
alias dpl='docker pull $args'
alias dp='docker ps $args'
alias dcu='docker-compose up $args'
alias dcd='docker-compose down $args'

# elm
alias es='elm init'
alias ei='elm install $args'
alias eb='elm bump'
alias em='elm make $args'
alias er='elm reactor'

# git
alias gl='git log --oneline $args'
alias ga='git add $args'
alias gb='git branch $args'
alias gc='git commit $args'
alias gd='git diff $args'
alias gm='git merge $args'
alias gs='git status'
alias gcl='git clone $args'
alias gco='git checkout $args'
alias gdc='git diff --cached $args'
alias grb='git rebase $args'
alias grs='git reset $args'
alias gst='git stash $args'
alias gpl='git pull $args'
alias gps='git push $args'

# stack haskell
alias hs='stack runghc $args'
alias hsb='stack build $args'
alias hsc='stack runhaskell $args'
alias ghci='stack ghci $args'
alias hp2ps='stack exec -- hp2ps -c $args'
alias hp2psd='stack exec -- hp2ps -c DQXSewingAssistant-exe.hp'
alias exe='.stack-work/dist/e626a42b/build/DQXSewingAssistant-exe/DQXSewingAssistant-exe.exe +RTS $args'

# yarn
alias ya='yarn add $args'
alias yb='yarn build $args'
alias yd='yarn dev $args'
alias yds='yarn dev:sample $args'
alias yg='yarn global $args'
alias yga='yarn global add $args'
alias ygr='yarn global remove $args'
alias ygu='yarn global upgrade $args'
alias yi='yarn install $args'
alias yl='yarn lint $args'
alias yr='yarn remove $args'
alias ys='yarn serve $args'
alias yt='yarn test $args'

export PATH="$HOME/.cargo/bin:$PATH"

eval "$(starship init bash)"
