from ubuntu:14.04

#ENV http_proxy http://140.251.198.81:3128
#ENV https_proxy http://140.251.198.81:3128

EXPOSE 8000 22

ENV PORT=8000

ENV ZERO_HOME /home/zero
ENV ZERO_USER zero

#ENV TROVE_PW Tc.Q92y.9iCU6
ENV ZERO_PW zero4life


RUN apt-get update && apt-get install -y software-properties-common 

RUN apt-add-repository ppa:brightbox/ruby-ng
RUN apt-add-repository ppa:fkrull/deadsnakes

RUN apt-get update && apt-get install -y apt-transport-https tar less git curl vim wget unzip nano \
        netcat mercurial unzip postgresql-client build-essential checkinstall \
	libreadline-gplv2-dev libncursesw5-dev libssl-dev libsqlite3-dev tk-dev libgdbm-dev libc6-dev libbz2-dev ruby-dev \ 
	zlib1g-dev build-essential libyaml-dev sqlite3 libxml2-dev libxslt1-dev libcurl4-openssl-dev \
	libffi-dev gnupg2 ruby2.0 ruby-all-dev python2.7 python-software-properties

RUN rm /usr/bin/ruby && sudo ln -s /usr/bin/ruby2.0 /usr/bin/ruby
RUN rm -fr /usr/bin/gem && sudo ln -s /usr/bin/gem2.0 /usr/bin/gem

RUN curl -sL https://deb.nodesource.com/setup_0.12 | sudo -E bash - 

RUN apt-get install -y nodejs
RUN npm install -g n

RUN n 0.12.18

#RUN curl -sSL https://rvm.io/mpapis.asc | gpg2 --import -
#RUN gpg2 --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
#RUN gpg2 --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
#RUN \curl -sSL https://get.rvm.io | bash -s stable --rails
#RUN source /usr/local/rvm/scripts/rvm

#RUN apt-add-repository -y ppa:rael-gc/rvm
#RUN apt-get update
#RUN apt-get install -y rvm
#RUN /bin/bash -c "source /usr/share/rvm/scripts/rvm"
#RUN /bin/bash -l -c "rvm install ruby-2.1.4"
#RUN /bin/bash -l -c "rvm use --default ruby-2.1.4"
RUN gem install sass --no-user-install

RUN npm install -g bower@1.3.12
RUN npm install -g grunt@0.4.5
RUN npm install -g grunt-cli@0.1.13


RUN mkdir -p $ZERO_HOME
RUN useradd -c "ZEROZ0R" -s /bin/bash ${ZERO_USER}
RUN echo "${ZERO_USER}:${ZERO_PW}" | chpasswd
RUN usermod -aG sudo $ZERO_USER
RUN chown -R $ZERO_USER:$ZERO_USER $ZERO_HOME
WORKDIR $ZERO_HOME 
USER $ZERO_USER

#RUN wget https://www.python.org/ftp/python/2.7.13/Python-2.7.13.tgz
#RUN cd Python-2.7.13

#RUN sudo ./configure
#RUN sudo make install
#RUN cd ..

RUN git clone https://github.com/mondaychen/zero.git

#RUN cd trove-dev
WORKDIR $ZERO_HOME/zero
RUN npm install
RUN bower install
RUN grunt build

CMD ["npm","start"]
