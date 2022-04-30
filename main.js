/**  
 * 1 . render songs
 * 2 . Scroll top
 * 3 . play /pause/seek
 * 4 . CD rotate
 * 5 . Next/prev
 * 6 . Random 
 * 7 . Next/repeat when ended
 * 8 . Active song
 * 9 . Scroll active song into views
 * 10 . Play song when click
 *              
 */


const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = "TUAN_ANH";


const heading = $('header h2');
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playlist = $('.playlist');
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const volume_slider = $('.volume_slider')


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,

    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    songs: [{
            name: 'Nơi Ta Chờ Em',
            singer: 'Will',
            path: './music/song5.mp3',
            image: './img/noita.img'
        },
        {
            name: 'Chìm sâu',
            singer: 'MCK',
            path: './music/song1.mp3',
            image: './img/song5.img'
        },
        {
            name: 'NYC',
            singer: 'Spinnin',
            path: './music/song2.mp3',
            image: './img/unnamed.img'
        },
        {
            name: 'Let Go',
            singer: 'Beau Young Prince',
            path: './music/song3.mp3',
            image: './img/spide.img'
        },
        {
            name: 'Ánh Sao và bầu trời',
            singer: 'Trí',
            path: './music/song4.mp3',
            image: './img/song4.img'
        },
        {
            name: 'Ngọn Nến Trước Gió',
            singer: 'LK',
            path: './music/song6.mp3',
            image: './img/song6.img'
        },
        {
            name: 'Im lặng',
            singer: 'LK',
            path: './music/song7.mp3',
            image: './img/song7.img'
        },


    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },


    //====render==================
    render: function() {
        const htmls = this.songs.map(function(song, index) {
            return `
            <div data-index="${index}"  class="song ${index===app.currentIndex ? "active ":""} " >
            <div class="thumb" style="background-image: url('${song.image}')">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>`
        })
        playlist.innerHTML = htmls.join('')
    },
    ////=====================định nghĩa cho thuộc tính=============
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function() {
        //===============Xử lý phóng to thu nhỏ CD===============
        const _this = this // gọi this(app) ở bên ngoài handleEvents gán nó bằng _this
        const cdWidth = cd.offsetWidth

        // Xử lý CD quay và dừng
        const cdThumbAnimate = cdThumb.animate([{
            transform: 'rotate(360deg)' // quay 360
        }], {
            duration: 60000, //quay trong 10s
            interation: Infinity
        })
        cdThumbAnimate.pause()

        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth
        }

        ///==============Xử lý khi click Play===========
        playBtn.onclick = function() {
                if (_this.isPlaying) {
                    audio.pause();

                } else {
                    audio.play();
                }

            }
            //Khi song đc play
        audio.onplay = function() {
                _this.isPlaying = true;
                player.classList.add('playing')
                cdThumbAnimate.play()
            }
            //Khi song đc pause
        audio.onpause = function() {
                _this.isPlaying = false;
                player.classList.remove('playing')
                cdThumbAnimate.pause()

            }
            // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent

            }

        }



        //Xử lý khi tua song
        progress.oninput = function(e) {
            const seekTime = (audio.duration * e.target.value) / 100;
            audio.currentTime = seekTime;

        }

        //thay đổi âm thanh bài hát
        volume_slider.oninput = function() {
            const seekVolume = volume_slider.value / 100;
            audio.volume = seekVolume;
            // console.log(seekVolume);
        }



        //Khi next bbài hát
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play();
            _this.scrollToActiveSong()
        }

        //Khi prev bbài hát
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play();
            _this.scrollToActiveSong()


        }

        // khi xử lý bật tắt random bài hát
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig("isRandom", _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom) // đối số thứ 2 của toggle là boolean nếu true thì nó add còn false thì remove class

        }

        // xử lý lặp lại bài hát
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig("isRepeat", _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        //Xử lý next song khi audio ended
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }

            audio.play()

        }

        //lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')

            if (songNode || e.target.closest('.option')) {
                // xử lý khi click vào song
                if (songNode) {
                    _this.currentIndex = songNode.dataset.index
                    _this.loadCurrentSong();
                    audio.play()
                }
            }
        }
    },




    scrollToActiveSong: function() {
        setTimeout(function() {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 300)
    },

    //load song
    loadCurrentSong: function() {

        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path

        //render lại active
        if ($('.song.active')) {
            $('.song.active').classList.remove('active');
        }
        const list = $$('.song');
        list.forEach((song) => {
            if (song.getAttribute('data-index') == this.currentIndex) { //nếu trong atttribute có data index == chỉ số bài  hát thì add active vào
                song.classList.add('active');
            }
        });
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat

    },


    nextSong: function() {
        this.currentIndex++
            if (this.currentIndex >= this.songs.length) {
                this.currentIndex = 0
            }
        this.loadCurrentSong()

    },
    prevSong: function() {
        this.currentIndex--
            if (this.currentIndex < 0) {
                this.currentIndex = this.songs.length - 1
            }
        this.loadCurrentSong()

    },
    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex) //loại bỏ trường hợp lặp lại cái cũ
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },



    star: function() {
        //gán câu hình từ config vào obj app
        this.loadConfig();
        //định nghĩa các thuộc tính cho obj
        this.defineProperties()

        //lắng nghe xử lý các sụ kiện
        this.handleEvents()

        //tải thông tin bài hát đầu tiên vào UI : used interface khi chạy ứng dụng
        this.loadCurrentSong()


        //render playlíst
        this.render()
            //hiển thị trạng thái ban đầu của button repat và random
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
}
app.star()