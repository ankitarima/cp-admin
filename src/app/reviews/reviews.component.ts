import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize, first } from 'rxjs/operators';


@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {

  config = {
    placeholder: '',
    tabsize: 2,
    height: 200,
    uploadImagePath: '/api/upload',
    toolbar: [
        ['misc', ['codeview', 'undo', 'redo']],
        ['style', ['bold', 'italic', 'underline', 'clear']],
        ['font', ['strikethrough', 'superscript', 'subscript']],
        ['fontsize', ['fontname', 'fontsize', 'color']],
        ['para', ['style', 'ul', 'ol', 'paragraph', 'height']],
        ['insert', ['table', 'picture', 'link', 'video', 'hr']]
    ],
    fontNames: ['Helvetica', 'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Roboto', 'Times']
  }

  rform = new FormGroup({
    id: new FormControl(null),
    college_name: new FormControl('',Validators.required),
    slug: new FormControl('', Validators.required),
    featured_image: new FormControl('',Validators.required),
    logo: new FormControl('',Validators.required),
    more_name: new FormControl('',Validators.required),
    college_type: new FormControl('', Validators.required),
    foundation_year: new FormControl('',Validators.required),
    campus_area: new FormControl(''),
    college_city: new FormControl('',Validators.required),
    college_state: new FormControl('', Validators.required),
    basic_info: new FormControl('',Validators.required),
    connectivity: new FormControl('',Validators.required),
    ranking: new FormControl(''),
    eligibility_criteria: new FormControl('',Validators.required),
    admission_proccess: new FormControl('',Validators.required),
    offered_courses: new FormControl('',Validators.required),
    seat_matrix: new FormControl('',Validators.required),
    alumni: new FormControl(''),
    fees: new FormControl(''),
    fee_waiver: new FormControl(''),
    placements: new FormControl(''),
    facilities: new FormControl(''),
    college_pros: new FormControl('', Validators.required),
    college_cons: new FormControl('',Validators.required),
    review_video: new FormControl(''),
    faq: new FormControl(''),
    college_contact: new FormControl(''),
    tags: new FormControl('',Validators.required)

  });

  public isSubmitting = false;
  public path: any;
  public imgSrc = "assets/images/placeholder-image.png";
  public LogoimgSrc = "assets/images/placeholder-image.png"

  public reviews = [] as any;
  public slugs = [] as any;


  constructor(
    private db: AngularFirestore,
    private fs: AngularFireStorage
  ) { }

  ngOnInit(): void {

    this.db.collection('college_reviews').snapshotChanges().subscribe((resp)=>{
      this.reviews = [];
      this.slugs = [];
      resp.forEach((data:any)=>{
        // console.log(data)
        const review = data.payload.doc.data() as any;
        Object.assign(review,{id: data.payload.doc.id})
        this.reviews.push(review);
        this.slugs.push(review.slug);
      })

      // console.log(this.reviews);
      // console.log(this.slugs)
    })

  }

  onFile(event: any){
    // console.log(event.target.value)
    if(event.target.value){
      this.imgSrc = event.target.value;
    }else{
      this.imgSrc = "assets/images/placeholder-image.png";
    }
  }

  onLogoFile(event: any){
    // console.log(event.target.value)
    if(event.target.value){
      this.LogoimgSrc = event.target.value;
    }else{
      this.LogoimgSrc = "assets/images/placeholder-image.png";
    }
  }

  onSubmit(){
     this.rform.patchValue({
       slug: this.string_to_slug(this.rform.value.college_name),
       tags: this.rform.value.tags.toLowerCase().split(',')
     })
    if(this.rform.invalid){
      console.log(this.rform.value)
      alert('All fields are required');
      return
    }else if (this.rform.value.id == null){
      this.isSubmitting = true;
      const data = this.rform.value;
      delete data.id;
      console.log(this.rform.value);
      if(!this.slugs.includes(this.rform.value.slug )){
        this.db.collection('college_reviews').add(data).then(()=>{
            // this.rform.reset();
            // this.LogoimgSrc = this.imgSrc = "assets/images/placeholder-image.png"
            this.isSubmitting = false;
        }).catch((err)=>{
            console.log(err)
        })
      }else{
        alert('College with same slug/name already exists')
        this.isSubmitting = false;
      }
    }else if (this.rform.value.id){
        this.isSubmitting = true;

        const data = this.rform.value;
        const id = data.id;
        delete data.id;
        console.log(data)
        this.db.doc('college_reviews/'+id).update(data).then(()=>{
          // this.rform.reset();
          // this.LogoimgSrc = this.imgSrc = "assets/images/placeholder-image.png"
          this.isSubmitting = false;
        }).catch((err)=>{
          this.isSubmitting = false;
            console.log(err)
        })
    }

   }

   edit(data:any){
    console.log(data);
    this.imgSrc = data.featured_image;
    this.LogoimgSrc = data.logo;
    this.rform.patchValue(data)
  }

  publish(data:any){

    console.log(data)
    if(data.status !== 'public'){
      const reviews = [] as any
      this.db.collection('college_reviews').ref.where('slug','==', data.slug).get().then((resp)=>{
        resp.forEach((val:any)=>{
          reviews.push(val.id)
        })
      }).then(()=>{
        if(reviews.length == 1){
          this.db.doc('college_reviews/'+reviews[0]).update({
            status: 'public'
          })
        }else{
          alert('mutliple reviews with same name | Contact admin')
        }
      })
    }else if(data.status === 'public'){
     let conf =  confirm('Are you sure to unpublish it ?');
     if(conf == true){
      const reviews = [] as any
      this.db.collection('college_reviews').ref.where('slug','==', data.slug).get().then((resp)=>{
        resp.forEach((val:any)=>{
          reviews.push(val.id)
        })
        console.log(reviews);
      }).then(()=>{
        if(reviews.length == 1){
          this.db.doc('college_reviews/'+reviews[0]).update({
            status: 'draft'
          })
        }else{
          alert('mutliple reviews with same name | Contact admin')
        }
      })
     }
    }

  }

  string_to_slug(str) {
    str = str.replace(/^\s+|\s+$/g, ""); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    var from = "åàáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to = "aaaaaaeeeeiiiioooouuuunc------";

    for (var i = 0, l = from.length; i < l; i++) {
      str = str.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
    }

    str = str
      .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
      .replace(/\s+/g, "-") // collapse whitespace and replace by -
      .replace(/-+/g, "-") // collapse dashes
      .replace(/^-+/, "") // trim - from start of text
      .replace(/-+$/, ""); // trim - from end of text

    return str;
  }

}
